/**
 * Honest rendering of absent values.
 *
 * The no-dummy-data rule cuts both ways. It forbids inventing a value, and it
 * also forbids letting an absence *look* like a value: a KPI that renders `0`
 * because the backend said `null` is claiming a measurement nobody took, and a
 * blank name renders like a redaction rather than a gap.
 *
 * So an absence is put on the screen in words. Callers pass the honest label
 * that fits their context.
 */

/** The default mark for a value that is not recorded. */
export const ABSENT = '—';

/** `null` / `undefined` / whitespace-only → the absent label; else the string. */
export function orDash(value: unknown, absent: string = ABSENT): string {
  if (value === null || value === undefined) return absent;
  if (typeof value === 'string' && value.trim() === '') return absent;
  return String(value);
}

/**
 * A count that may legitimately be unmeasured.
 *
 * `null` is deliberately NOT `0`: the backend reports `null` for
 * "pending evidence" because nothing has measured it, and rendering that as
 * zero would read as "nothing is pending".
 */
export function countOr(
  value: number | null | undefined,
  absent = 'Not measured'
): string {
  return typeof value === 'number' && Number.isFinite(value)
    ? String(value)
    : absent;
}

/** A date that may legitimately be absent. */
export function dateOr(
  value: string | null | undefined,
  absent = 'Not recorded'
): string {
  if (!value) return absent;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? absent : parsed.toLocaleDateString();
}

/** A date+time that may legitimately be absent. */
export function dateTimeOr(
  value: string | null | undefined,
  absent = 'Never'
): string {
  if (!value) return absent;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? absent : parsed.toLocaleString();
}

/**
 * Render a scheduled slot.
 *
 * Not every scheduled inspection carries a time, and the previous UI printed
 * "10:00 AM" when it did not — a specific, invented appointment time on a
 * regulator's schedule.
 */
export function timeOr(
  value: string | null | undefined,
  absent = 'Time not set'
): string {
  if (!value) return absent;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return absent;
  return parsed.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}
