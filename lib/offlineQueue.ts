/**
 * The offline queue, held in the browser.
 *
 * This is the client half of `apps.sync`. Every write the inspector makes in the
 * field is attempted against the network first; when the network is not there,
 * the write is journaled here and replayed on reconnect. `POST sync/queue/`
 * takes it from there — this module never applies anything itself, because
 * there is exactly one write path in the platform and it is the server's.
 *
 * Hand-rolled over IndexedDB rather than pulled from a library: the store is
 * three operations over one object store, and a queue that decides what a
 * statutory write means is not something to take on trust from a dependency.
 *
 * ## What this module deliberately does NOT do
 *
 * - **It does not invent a payload.** The caller hands over exactly what it
 *   would have POSTed. A queue item that has been reshaped on the way in is a
 *   write the server never agreed to.
 * - **It does not retry forever silently.** Exhaustion is the server's call
 *   (`max_retries` lives in `SyncQueueItem`), but a local item that keeps
 *   failing to even *reach* the queue records why, so the Sync Center can say
 *   what is stuck rather than only how many.
 * - **It does not pretend to exist when it does not.** IndexedDB is unavailable
 *   in some private-browsing modes and can throw on open. `offlineStoreState()`
 *   reports that as its own state — "the queue is empty" and "this browser has
 *   no queue" are different sentences, and an inspector deciding whether to
 *   trust a capture needs the right one.
 */

const DB_NAME = 'nexucon-inspector';
const DB_VERSION = 1;
const STORE = 'sync_queue';

/** Where a locally-held item has got to. Not the server's `sync_status`. */
export type LocalItemState =
  /** Captured, not yet accepted by `POST sync/queue/`. */
  | 'QUEUED'
  /** Accepted by the server; the reference it returned is stored alongside. */
  | 'SENT'
  /** The server refused it, or it could not be sent. `last_error` says why. */
  | 'FAILED';

export interface LocalQueueItem {
  /**
   * Client-generated idempotency key — the primary key here and the unique
   * constraint server-side. A replayed enqueue with the same key and the same
   * payload is a retry; the server deduplicates it rather than writing twice.
   */
  client_item_id: string;
  entity_type: 'INSPECTION' | 'FINDING' | 'STOP_WORK_ORDER' | 'EVIDENCE' | 'TELEMETRY';
  /** The target row's id. Required by the server for an UPDATE. */
  entity_id: string;
  action: 'CREATE' | 'UPDATE';
  payload: Record<string, unknown>;
  /** When the capture happened — not when it was sent. */
  queued_at: string;
  state: LocalItemState;
  /** How many times a send has been attempted. */
  attempts: number;
  /** The server's `reference` once accepted. */
  remote_reference?: string;
  /** The last failure, verbatim and human-readable. Never a stack trace. */
  last_error?: string;
}

/** Whether this browser can hold a queue at all. */
export type OfflineStoreState = 'ready' | 'unavailable';

interface StoreHealth {
  state: OfflineStoreState;
  /** Present only when `state === 'unavailable'`. */
  reason?: string;
}

let cachedHealth: StoreHealth | null = null;

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('This browser does not expose IndexedDB.'));
      return;
    }
    let request: IDBOpenDBRequest;
    try {
      request = indexedDB.open(DB_NAME, DB_VERSION);
    } catch (err: any) {
      // Some private-browsing modes throw synchronously on open rather than
      // firing onerror. Both paths have to be caught or the app dies here.
      reject(new Error(err?.message || 'IndexedDB could not be opened.'));
      return;
    }
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE)) {
        const store = db.createObjectStore(STORE, { keyPath: 'client_item_id' });
        // Ordering is by capture time, not insertion: a replay has to apply a
        // CREATE before the UPDATE that depends on it, and a store that hands
        // items back in an arbitrary order cannot promise that.
        store.createIndex('queued_at', 'queued_at');
        store.createIndex('state', 'state');
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () =>
      reject(new Error(request.error?.message || 'IndexedDB could not be opened.'));
    request.onblocked = () =>
      reject(new Error('Another tab is holding an older version of the local queue open.'));
  });
}

/**
 * Probe the store once and remember the answer.
 *
 * The result is cached because it cannot change within a page's life, and
 * because probing on every render would open a connection per render.
 */
export async function offlineStoreState(): Promise<StoreHealth> {
  if (cachedHealth) return cachedHealth;
  try {
    const db = await openDatabase();
    db.close();
    cachedHealth = { state: 'ready' };
  } catch (err: any) {
    cachedHealth = {
      state: 'unavailable',
      reason: err?.message || 'The local queue is not available in this browser.',
    };
  }
  return cachedHealth;
}

function withStore<T>(
  mode: IDBTransactionMode,
  work: (store: IDBObjectStore) => IDBRequest<T>
): Promise<T> {
  return openDatabase().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const tx = db.transaction(STORE, mode);
        const request = work(tx.objectStore(STORE));
        request.onsuccess = () => resolve(request.result);
        request.onerror = () =>
          reject(new Error(request.error?.message || 'The local queue rejected the write.'));
        tx.oncomplete = () => db.close();
        tx.onabort = () => {
          db.close();
          reject(new Error(tx.error?.message || 'The local queue transaction was aborted.'));
        };
      })
  );
}

/**
 * A key that is unique per capture and stable across a retry.
 *
 * `crypto.randomUUID` is unavailable outside a secure context, which is exactly
 * the situation a field device in a dead spot may be in. The fallback is built
 * from the clock and `crypto.getRandomValues` when that exists — it is an
 * identifier, not a security control, but it must not collide with another
 * capture taken in the same millisecond.
 */
export function newClientItemId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  const random =
    typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function'
      ? Array.from(crypto.getRandomValues(new Uint8Array(8)))
          .map((b) => b.toString(16).padStart(2, '0'))
          .join('')
      : Math.random().toString(16).slice(2, 18);
  return `${Date.now().toString(36)}-${random}`;
}

export interface EnqueueInput {
  entity_type: LocalQueueItem['entity_type'];
  action: LocalQueueItem['action'];
  payload: Record<string, unknown>;
  entity_id?: string;
  /** Supply one to make a retry idempotent; omit to have one generated. */
  client_item_id?: string;
}

/**
 * Journal one write for later.
 *
 * Returns the stored item, so the caller can show the inspector the key their
 * capture is filed under. That key is the only handle on the item until it
 * reaches the server, and it is what makes a second attempt a retry rather than
 * a duplicate finding.
 */
export async function enqueueOffline(input: EnqueueInput): Promise<LocalQueueItem> {
  const item: LocalQueueItem = {
    client_item_id: input.client_item_id || newClientItemId(),
    entity_type: input.entity_type,
    entity_id: input.entity_id || '',
    action: input.action,
    payload: input.payload,
    queued_at: new Date().toISOString(),
    state: 'QUEUED',
    attempts: 0,
  };
  await withStore('readwrite', (store) => store.put(item));
  return item;
}

/** Every locally-held item, oldest capture first. */
export async function listOffline(): Promise<LocalQueueItem[]> {
  const rows = await withStore<LocalQueueItem[]>('readonly', (store) =>
    store.getAll() as IDBRequest<LocalQueueItem[]>
  );
  return rows.sort((a, b) => a.queued_at.localeCompare(b.queued_at));
}

export async function countOffline(): Promise<number> {
  return withStore<number>('readonly', (store) => store.count());
}

export async function getOffline(clientItemId: string): Promise<LocalQueueItem | null> {
  const row = await withStore<LocalQueueItem | undefined>('readonly', (store) =>
    store.get(clientItemId) as IDBRequest<LocalQueueItem | undefined>
  );
  return row ?? null;
}

/**
 * Record that the server accepted an item, keeping the row rather than deleting
 * it.
 *
 * Deleting on success would make the local store unable to answer "did this
 * capture get through?" a minute later, which is the one question an inspector
 * in a dead spot actually asks. The row is marked SENT with the server's own
 * reference and the Sync Center reports the server's view as the authority.
 */
export async function markOfflineSent(
  clientItemId: string,
  remoteReference: string
): Promise<void> {
  const existing = await getOffline(clientItemId);
  if (!existing) return;
  await withStore('readwrite', (store) =>
    store.put({
      ...existing,
      state: 'SENT' as LocalItemState,
      remote_reference: remoteReference,
      attempts: existing.attempts + 1,
      last_error: undefined,
    })
  );
}

export async function markOfflineFailed(
  clientItemId: string,
  error: string
): Promise<void> {
  const existing = await getOffline(clientItemId);
  if (!existing) return;
  await withStore('readwrite', (store) =>
    store.put({
      ...existing,
      state: 'FAILED' as LocalItemState,
      attempts: existing.attempts + 1,
      last_error: error,
    })
  );
}

/**
 * Forget a locally-held item.
 *
 * Only ever called for an item the server has already refused in a way a retry
 * cannot fix, and only from a screen where a human made that call. An item that
 * is merely failing stays.
 */
export async function discardOffline(clientItemId: string): Promise<void> {
  await withStore('readwrite', (store) => store.delete(clientItemId));
}
