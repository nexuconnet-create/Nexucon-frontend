/**
 * A human-readable message from a failed request whose body is a Blob.
 *
 * With `responseType: 'blob'` — used for report downloads and for import
 * templates — the *error* body is a Blob too, so the usual
 * `err.response.data.detail` reads as `undefined` and every failure collapses
 * to a generic fallback. The server's own explanation of what was wrong is
 * sitting in the blob, and it is usually the only sentence worth showing.
 *
 * `fallback` is required rather than defaulted: only the caller knows what was
 * being attempted, and a shared "something went wrong" would hide which request
 * failed on a page that makes several.
 */
export async function describeBlobError(err: any, fallback: string): Promise<string> {
  const body = err?.response?.data;
  if (!(body instanceof Blob)) {
    return (
      err?.response?.data?.detail ||
      err?.response?.data?.error ||
      err?.response?.data?.message ||
      err?.message ||
      fallback
    );
  }
  try {
    const parsed = JSON.parse(await body.text());
    return parsed?.detail || parsed?.error || parsed?.message || fallback;
  } catch {
    // A non-JSON blob error body (an HTML error page from a proxy, say) says
    // nothing this app can quote, so the caller's own sentence stands.
    return fallback;
  }
}
