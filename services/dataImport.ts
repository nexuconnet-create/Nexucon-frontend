import api from './api';

/**
 * The manual import pipeline: upload → validate → commit.
 *
 * Three stages rather than one, and the split is the point. `upload/` stores
 * and attests the bytes and parses nothing; `validate/` reads every row and
 * writes no registry rows; `commit/` writes them, all-or-nothing, inside one
 * transaction that also sets the batch's status. A file that is wrong is
 * therefore found out before anything statutory exists.
 *
 * Nothing here reports a row as accepted on the client's own judgement. The
 * counts and the per-row errors are the server's.
 */

/** One record type the registry can import, as `GET import/record-types/` lists it. */
export interface ImportRecordType {
  record_type: string;
  model_label: string;
  description: string;
  columns: string[];
  required_columns: string[];
  /** True when consecutive rows for one element form a single record. */
  groups_consecutive_rows: boolean;
}

export interface ImportBatch {
  id: string;
  batch_reference: string;
  /** A snapshot of the uploader's name — survives the user being deleted. */
  inspector_name: string;
  project: string;
  project_name: string;
  inspection: string | null;
  inspection_reference: string | null;
  import_type: string;
  record_type: string;
  file_name: string;
  file_size_bytes: number | null;
  file_url: string | null;
  /** The server's digest over the bytes it stored, not the client's claim. */
  sha256_hash: string;
  import_status: string;
  record_count: number;
  valid_record_count: number;
  invalid_record_count: number;
  skipped_row_count: number;
  error_count: number;
  /** True when the error list on `status/` was capped. */
  errors_truncated: boolean;
  can_commit: boolean;
  /** True when this upload matched a batch that already existed. */
  deduplicated: boolean;
  validated_at: string | null;
  imported_at: string | null;
  created_at: string;
  updated_at: string;
}

/** One rejected row, as the batch's own record of it. */
export interface ImportRowError {
  row_number?: number;
  row_label?: string;
  message?: string;
  [key: string]: unknown;
}

export interface ImportBatchStatus extends ImportBatch {
  errors: ImportRowError[];
}

export async function getImportRecordTypes(): Promise<ImportRecordType[]> {
  const res: any = await api.get('/import/record-types/');
  return Array.isArray(res) ? res : (res?.results || res?.data || []);
}

/** `GET import/batches/` — this inspector's own uploads, newest first. */
export async function getImportBatches(params?: {
  status?: string;
  project?: string;
}): Promise<ImportBatch[]> {
  const res: any = await api.get('/import/batches/', { params });
  return Array.isArray(res) ? res : (res?.results || res?.data || []);
}

/**
 * `POST import/upload/` — store the file and attest to it.
 *
 * `project` is required and is scope-checked server-side. `inspection` is where
 * a FINDING row gets its site visit when the file itself does not name one.
 *
 * `record_type` and `import_type` are *claims*. The bytes decide, and a claim
 * that contradicts them comes back refused naming both — so the caller states
 * what the inspector picked and is told when the file they chose is not the
 * file they described, rather than having the file silently reinterpreted.
 *
 * A 200 (rather than a 201) means the identical bytes were already uploaded for
 * this inspector and project, and the existing batch was returned as
 * `deduplicated: true`. An already-imported batch is never reused.
 */
export async function uploadImportFile(
  params: {
    file: File;
    project: string;
    inspection?: string | null;
    recordType?: string;
    importType?: string;
  },
  onProgress?: (fraction: number) => void
): Promise<ImportBatch> {
  const form = new FormData();
  form.append('file', params.file);
  form.append('project', params.project);
  if (params.inspection) form.append('inspection', params.inspection);
  if (params.recordType) form.append('record_type', params.recordType);
  if (params.importType) form.append('import_type', params.importType);

  const res: any = await api.post('/import/upload/', form, {
    onUploadProgress: (event: any) => {
      if (!onProgress || !event?.total) return;
      onProgress(Math.min(1, event.loaded / event.total));
    },
  });
  return (res?.data || res) as ImportBatch;
}

/**
 * `POST import/<id>/validate/` — check every row.
 *
 * Writes nothing. A batch with nine good rows and one bad comes back FAILED
 * with `invalid_record_count: 1` and the row's message, so the inspector can
 * see how close the file was rather than only that it was refused.
 */
export async function validateImportBatch(batchId: string): Promise<ImportBatchStatus> {
  const res: any = await api.post(`/import/${batchId}/validate/`);
  return (res?.data || res) as ImportBatchStatus;
}

/**
 * `POST import/<id>/commit/` — write the rows.
 *
 * Re-validates inside its own transaction, so a rule that changed between
 * validate and commit cannot let a row through. A 409 means nothing was
 * written: the rows and the batch's status are committed together or not at
 * all, which is what stops a rollback leaving a batch claiming to be imported
 * with zero rows behind it.
 */
export async function commitImportBatch(batchId: string): Promise<ImportBatch> {
  const res: any = await api.post(`/import/${batchId}/commit/`);
  return (res?.data || res) as ImportBatch;
}

/** `GET import/<id>/status/` — counts, and the rows that were refused. */
export async function getImportBatchStatus(
  batchId: string,
  errorLimit?: number
): Promise<ImportBatchStatus> {
  const res: any = await api.get(`/import/${batchId}/status/`, {
    params: errorLimit ? { error_limit: errorLimit } : undefined,
  });
  return (res?.data || res) as ImportBatchStatus;
}

/**
 * `GET import/templates/<record_type>/` — the file to fill in.
 *
 * Fetched as a Blob because the response is a file with a
 * `Content-Disposition`, not JSON. Only csv and json are served; a PDF template
 * is refused with the reason, since a PDF template would be a promise the
 * import cannot keep. A refusal arrives as a Blob too — read it with
 * `describeBlobError` from `lib/apiErrors`, not with `err.response.data.detail`.
 */
export async function downloadImportTemplate(
  recordType: string,
  format: 'csv' | 'json' = 'csv'
): Promise<Blob> {
  const res: any = await api.get(`/import/templates/${recordType}/`, {
    params: { format },
    responseType: 'blob',
  });
  return res as Blob;
}
