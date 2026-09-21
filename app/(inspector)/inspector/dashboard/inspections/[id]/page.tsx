"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Check,
  X,
  AlertCircle,
  Hash,
  Send,
  LogOut,
  PenLine,
  Paperclip,
  ShieldCheck,
  ShieldAlert,
  ShieldQuestion,
  Info,
} from "lucide-react";
import {
  getInspectorInspectionById,
  getInspectorInspectionExecution,
  getInspectorInspectionEvidence,
  uploadInspectorEvidence,
  verifyInspectorEvidence,
  computeFileSha256,
  checkinInspectorInspection,
  checkoutInspectorInspection,
  submitInspectorExecution,
  signOffInspectorSubmission,
  verifyInspectorExecution,
  saveInspectorOutcome,
  logInspectorFinding,
  type ChecklistResultPayload,
  type EvidenceFilePayload,
  type EvidenceRecordWithFile,
  type EvidenceVerification,
  type InspectionExecutionState,
} from "@/services/inspector";
import { Inspection } from "@/services/inspections";
import { enqueueOffline, offlineStoreState } from "@/lib/offlineQueue";
import { isOffline } from "@/lib/syncEngine";
import { dateTimeOr, orDash } from "@/lib/display";

/** One checklist row: the template's item plus the inspector's own verdict. */
interface ChecklistRow {
  item_id: string;
  title: string;
  required: boolean;
  /** The house value the backend stores. `null` = not yet decided. */
  result: "PASS" | "FAIL" | null;
  notes: string;
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
 * The device's own position, from the browser.
 *
 * The previous version of this page hardcoded `latitude: 6.4474, longitude:
 * 3.4842` — Lekki Phase 1 — and then, in a `catch`, set `gpsVerified = true`
 * anyway. So the check-in recorded a Lagos coordinate for every inspection in
 * the country regardless of where the inspector actually stood, and a device
 * with location switched off produced a screen reading "Verified On-Site". On a
 * geofence whose entire purpose is attesting physical presence, that is the
 * defect and not a detail of it.
 *
 * `enableHighAccuracy` and `maximumAge: 0` are both load-bearing: a cached,
 * coarse fix is what makes a 50 m fence meaningless, and the accuracy the
 * browser reports alongside the fix is what the backend uses to decide whether
 * the fence can be certified at all.
 */
function readDevicePosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      reject(
        new Error(
          "This device does not expose a location sensor, so site presence cannot be verified."
        )
      );
      return;
    }
    navigator.geolocation.getCurrentPosition(
      resolve,
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          reject(
            new Error(
              "Location permission was denied. Grant this app access to your position to check in on site."
            )
          );
        } else if (err.code === err.TIMEOUT) {
          reject(
            new Error(
              "Timed out waiting for a GPS fix. Move into the open and try again."
            )
          );
        } else {
          reject(
            new Error(
              "The device could not determine its position. Site presence cannot be verified."
            )
          );
        }
      },
      { enableHighAccuracy: true, timeout: 20000, maximumAge: 0 }
    );
  });
}

/** The geofence verdict, in words an inspector can act on. */
function geofenceVerdict(geofence: InspectionExecutionState["geofence"]): {
  label: string;
  tone: "ok" | "warn" | "bad" | "none";
  detail: string;
} {
  const radius =
    geofence.radius_source === "platform_default"
      ? `${geofence.radius_m} m platform default`
      : `${geofence.radius_m} m recorded on the project`;

  if (!geofence.state) {
    return {
      label: "Not evaluated",
      tone: "none",
      detail: "No check-in has been evaluated against this site's geofence yet.",
    };
  }
  if (geofence.state === "VERIFIED") {
    return {
      label: "Verified on-site",
      tone: "ok",
      detail: `${geofence.distance_m ?? "—"} m from the recorded site point, within the ${radius}.`,
    };
  }
  if (geofence.state === "OUTSIDE") {
    return {
      label: "Outside the site geofence",
      tone: "bad",
      detail: `${geofence.distance_m ?? "—"} m from the recorded site point, outside the ${radius}.`,
    };
  }
  return {
    label: "Recorded, not verifiable",
    tone: "warn",
    detail:
      geofence.reason === "PROJECT_COORDINATES_NOT_RECORDED"
        ? "This project has no site coordinates recorded, so the fix could not be checked against a geofence."
        : geofence.reason === "DEVICE_ACCURACY_EXCEEDS_RADIUS"
        ? `The device reported ±${geofence.accuracy_m ?? "?"} m accuracy, which is wider than the ${radius} it would have to certify.`
        : geofence.reason === "ACCURACY_NOT_REPORTED"
        ? "The device did not report its accuracy, so the fix could not be certified against the geofence."
        : `The geofence could not verify this position (${orDash(geofence.reason, "no reason recorded")}).`,
  };
}

const TONE_CLASSES: Record<string, string> = {
  ok: "bg-emerald-50 border-emerald-200 text-emerald-800",
  warn: "bg-amber-50 border-amber-200 text-amber-800",
  bad: "bg-rose-50 border-rose-200 text-rose-800",
  none: "bg-slate-50 border-slate-200 text-slate-600",
};

/**
 * An evidence record as the submission seals it, or `null` when it cannot be.
 *
 * A record whose file is missing or carries no digest is not sealable, and the
 * backend refuses the whole submission over one such entry — so it is excluded
 * here rather than sent and rejected. Records like that are real (an instrument
 * row, a GPR survey, has no uploaded bytes behind it) and they still belong in
 * the registry; they are simply not artifacts this submission can attest to.
 *
 * `url` falls back to `''`, not to a placeholder: `file_url` is null when the
 * deployment cannot hand out a link to the bytes, and the submission records
 * that absence as an empty string rather than inventing a location. The digest
 * is what attests the artifact; the URL is only where to find it.
 */
function toSubmissionEvidence(
  record: EvidenceRecordWithFile
): EvidenceFilePayload | null {
  const file = record.file;
  if (!file || !file.sha256_hash) return null;
  return {
    file_name: file.file_name,
    sha256: file.sha256_hash,
    url: file.file_url ?? "",
    file_type: file.content_type || "",
  };
}

/** The three answers verification can give, and the fourth state of not having asked. */
function verifyVerdict(file: EvidenceRecordWithFile["file"]): {
  label: string;
  tone: "ok" | "warn" | "bad" | "none";
  icon: typeof ShieldCheck;
} {
  if (!file) {
    return { label: "No file attached", tone: "none", icon: ShieldQuestion };
  }
  if (file.last_verify_ok === true) {
    return { label: "Bytes match the digest", tone: "ok", icon: ShieldCheck };
  }
  if (file.last_verify_ok === false) {
    return { label: "Bytes do NOT match the digest", tone: "bad", icon: ShieldAlert };
  }
  return { label: "Not yet verified", tone: "none", icon: ShieldQuestion };
}

function formatBytes(bytes: number | null): string {
  if (bytes === null || !Number.isFinite(bytes)) return "size not reported";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

export default function InspectorInspectionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const inspectionId = (params?.id as string) || "";

  const [inspection, setInspection] = useState<Inspection | null>(null);
  const [execution, setExecution] = useState<InspectionExecutionState | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [actionError, setActionError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const [checklistRows, setChecklistRows] = useState<ChecklistRow[]>([]);
  const [outcome, setOutcome] = useState<"PASSED" | "CONDITIONAL_PASS" | "FAILED">(
    "PASSED"
  );
  const [summaryNotes, setSummaryNotes] = useState("");
  const [signatureText, setSignatureText] = useState("");
  const [outcomeSaved, setOutcomeSaved] = useState(false);

  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSigningOff, setIsSigningOff] = useState(false);

  /**
   * The result of an on-demand re-check of the sealed submission, from
   * `GET inspections/{id}/execution/verify/`.
   *
   * Deliberately a separate call from the execution read: the read reports what
   * the server found when the page loaded, and this asks it again, now, without
   * the page having to be reloaded. That is what makes it worth a button — a
   * regulator who wants to know whether the stored record still hashes to what
   * was signed can ask, rather than trusting a value rendered minutes ago.
   */
  const [integrityCheck, setIntegrityCheck] = useState<{
    submission_hash: string;
    submission_valid: boolean;
    signoff_hash?: string;
    signoff_valid?: boolean;
  } | null>(null);
  const [integrityError, setIntegrityError] = useState<string | null>(null);
  const [isCheckingIntegrity, setIsCheckingIntegrity] = useState(false);

  // Finding modal
  const [isFindingModalOpen, setIsFindingModalOpen] = useState(false);
  const [findingTitle, setFindingTitle] = useState("");
  const [findingSeverity, setFindingSeverity] = useState<
    "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
  >("HIGH");
  const [findingDescription, setFindingDescription] = useState("");
  const [findingError, setFindingError] = useState<string | null>(null);
  const [isSavingFinding, setIsSavingFinding] = useState(false);
  /**
   * Set when a finding could not reach the server and was journaled on this
   * device instead. Separate from `findingError`, because it is not a failure:
   * the finding exists, it is just not in the registry yet, and the inspector
   * needs to be told which of those two situations they are in.
   */
  const [findingQueued, setFindingQueued] = useState<string | null>(null);

  // Evidence. `evidenceRecords` is read from the server, never assembled
  // locally: the digest that gets sealed into the submission is the one the
  // server computed over the bytes it stored, and a client-side list would be
  // the client's word for it.
  const [evidenceRecords, setEvidenceRecords] = useState<EvidenceRecordWithFile[]>([]);
  const [evidenceListError, setEvidenceListError] = useState<string | null>(null);
  const [isLoadingEvidence, setIsLoadingEvidence] = useState(false);
  const [isUploadingEvidence, setIsUploadingEvidence] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [evidenceError, setEvidenceError] = useState<string | null>(null);
  const [evidenceNotice, setEvidenceNotice] = useState<string | null>(null);
  const [evidenceDescription, setEvidenceDescription] = useState("");
  const [verifyingId, setVerifyingId] = useState<string | null>(null);
  const [lastVerification, setLastVerification] = useState<EvidenceVerification | null>(null);

  /** Re-read the execution state — the single source of truth after every write. */
  const refreshExecution = useCallback(async () => {
    if (!inspectionId) return null;
    const state = await getInspectorInspectionExecution(inspectionId);
    setExecution(state);
    return state;
  }, [inspectionId]);

  /**
   * Re-read this visit's evidence from the registry.
   *
   * Kept separate from `refreshExecution` because the two can fail
   * independently: evidence failing to load must not blank the checklist, and
   * it must not be reported as "no evidence attached" either. The error is held
   * in its own state so Step 3 can say which of the two happened.
   */
  const refreshEvidence = useCallback(async () => {
    if (!inspectionId) return;
    setIsLoadingEvidence(true);
    setEvidenceListError(null);
    try {
      setEvidenceRecords(await getInspectorInspectionEvidence(inspectionId));
    } catch (err) {
      setEvidenceListError(
        messageOf(err, "Could not read this inspection's evidence from the registry.")
      );
    } finally {
      setIsLoadingEvidence(false);
    }
  }, [inspectionId]);

  useEffect(() => {
    if (!inspectionId) return;
    let cancelled = false;
    setIsLoading(true);
    setLoadError(null);

    Promise.all([
      getInspectorInspectionById(inspectionId),
      getInspectorInspectionExecution(inspectionId),
    ])
      .then(([insp, exec]) => {
        if (cancelled) return;
        setInspection(insp);
        setExecution(exec);
        if (insp?.outcome && insp.outcome !== "PENDING") {
          setOutcome(insp.outcome as "PASSED" | "CONDITIONAL_PASS" | "FAILED");
          setOutcomeSaved(true);
        }
        if (insp?.summary_notes) setSummaryNotes(insp.summary_notes);

        // The checklist comes from the template the backend assembled for this
        // inspection type. The page previously shipped five hardcoded items
        // ("Foundation Excavation Depth & Bearing Strata Check" and so on) that
        // no template contained and no administrator had authored — an
        // inspector's statutory checklist is not something the client invents.
        const templateItems = exec?.checklist?.items ?? [];
        const recorded = insp?.checklist_results ?? [];
        setChecklistRows(
          templateItems.map((item) => {
            const prior = recorded.find(
              (r) => (r.item_id ?? r.id) === item.item_id
            );
            const priorResult =
              prior?.result ??
              (prior?.status === "PASSED"
                ? "PASS"
                : prior?.status === "FAILED"
                ? "FAIL"
                : null);
            return {
              item_id: item.item_id,
              title: item.title,
              required: item.required,
              result:
                priorResult === "PASS" || priorResult === "FAIL"
                  ? (priorResult as "PASS" | "FAIL")
                  : null,
              notes: prior?.notes ?? "",
            };
          })
        );
      })
      .catch((err) => {
        if (cancelled) return;
        setLoadError(
          messageOf(err, "Could not load this inspection from the server.")
        );
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [inspectionId]);

  // The evidence load is its own effect so a registry failure cannot take the
  // inspection, the checklist and the execution state down with it.
  useEffect(() => {
    if (!inspectionId) return;
    void refreshEvidence();
  }, [inspectionId, refreshEvidence]);

  const handleCheckin = async () => {
    setActionError(null);
    setNotice(null);
    setIsCheckingIn(true);
    try {
      const position = await readDevicePosition();
      const result = await checkinInspectorInspection(inspectionId, {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        gps_accuracy_m: Number.isFinite(position.coords.accuracy)
          ? position.coords.accuracy
          : null,
        device_time: new Date().toISOString(),
      });
      await refreshExecution();
      if (result.geofence?.state === "VERIFIED") {
        setNotice("Check-in verified against the site geofence.");
      } else {
        // Under 'warn' enforcement an unverified check-in is recorded rather
        // than refused. The inspector is told exactly which state it is in
        // instead of being shown a green tick either way.
        setNotice(
          `Check-in recorded as ${result.geofence?.state || "unverified"}. ${
            result.geofence?.reason || ""
          }`.trim()
        );
      }
    } catch (err) {
      // No `catch { setGpsVerified(true) }`. A failed check-in is a failed
      // check-in; the button stays, and the reason is shown.
      setActionError(messageOf(err, "Check-in failed."));
    } finally {
      setIsCheckingIn(false);
    }
  };

  const handleCheckout = async () => {
    setActionError(null);
    setNotice(null);
    setIsCheckingOut(true);
    try {
      // Position is optional on check-out: a device may have no fix on
      // leaving. If one is available it is recorded; if not, the absence is
      // recorded, which is what the endpoint expects.
      let coords: {
        latitude?: number;
        longitude?: number;
        gps_accuracy_m?: number | null;
        device_time?: string;
      } = { device_time: new Date().toISOString() };
      try {
        const position = await readDevicePosition();
        coords = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          gps_accuracy_m: Number.isFinite(position.coords.accuracy)
            ? position.coords.accuracy
            : null,
          device_time: new Date().toISOString(),
        };
      } catch {
        coords = { device_time: new Date().toISOString() };
      }
      const result = await checkoutInspectorInspection(inspectionId, coords);
      await refreshExecution();
      setNotice(
        `Checked out. ${
          result.checkout_latitude === null
            ? "No position was available on leaving, so none was recorded."
            : "Leaving position recorded."
        }`
      );
    } catch (err) {
      setActionError(messageOf(err, "Check-out failed."));
    } finally {
      setIsCheckingOut(false);
    }
  };

  const handleToggleItemStatus = (itemId: string, newStatus: "PASS" | "FAIL") => {
    setChecklistRows((prev) =>
      prev.map((row) =>
        row.item_id === itemId ? { ...row, result: newStatus } : row
      )
    );
  };

  /**
   * Record a finding against this visit, online or not.
   *
   * The two outcomes are genuinely different and are reported as such:
   *
   *  - **The server took it.** The finding is in the statutory registry.
   *  - **The device could not reach the server.** Nothing is lost: the exact
   *    payload that would have been POSTed is journaled in this browser's queue
   *    and handed over on reconnect, where the same serializer validates it.
   *
   * Only an unreachable server falls back to the queue. A refusal — a 400, a
   * 403, a validation error — is surfaced to the inspector unchanged, because
   * journaling a payload the server has already rejected would park a
   * permanently-failing item in the queue and hide the real problem behind a
   * "queued, will sync" message.
   *
   * A finding is journaled only with a description, which is stricter than the
   * online path: `log-finding/` accepts an empty one, while the queue's own
   * validator refuses it (`A CREATE FINDING needs description in its payload`).
   * Rather than file something the queue will reject on the next flush, the
   * offline case asks for the description up front and says why.
   */
  const handleAddFinding = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!findingTitle.trim()) return;
    setFindingError(null);
    setFindingQueued(null);

    const payload = {
      // The inspection is named in the payload, not only in the URL, because
      // the queue replays this into `FindingSerializer` rather than through
      // the `log-finding/` action, and that serializer needs the parent.
      inspection: inspectionId,
      title: findingTitle.trim(),
      // The inspector's own words, or nothing. The previous version
      // substituted "Defect recorded during mandatory site inspection." when
      // the field was left empty — a sentence the inspector never wrote,
      // filed as their corrective remedy on a statutory finding.
      description: findingDescription.trim(),
      severity: findingSeverity,
      category: "STRUCTURAL",
    };

    setIsSavingFinding(true);
    try {
      await logInspectorFinding(inspectionId, {
        title: payload.title,
        description: payload.description,
        severity: payload.severity,
        category: payload.category,
      });
      setIsFindingModalOpen(false);
      setFindingTitle("");
      setFindingDescription("");
    } catch (err) {
      if (!isOffline(err)) {
        // The modal used to close on failure too, so a finding that was never
        // stored looked exactly like one that was.
        setFindingError(messageOf(err, "Could not save this finding."));
        return;
      }

      const store = await offlineStoreState();
      if (store.state === "unavailable") {
        setFindingError(
          `This device cannot reach the server, and this browser will not hold a local queue (${store.reason}). The finding was not saved anywhere — do not close this window until you have connectivity.`
        );
        return;
      }
      if (!payload.description) {
        setFindingError(
          "This device cannot reach the server. A finding saved offline must carry a description — the queue's validator requires one, so an empty one would be refused on the next sync. Add a description and save again."
        );
        return;
      }

      try {
        const item = await enqueueOffline({
          entity_type: "FINDING",
          action: "CREATE",
          payload,
        });
        setIsFindingModalOpen(false);
        setFindingTitle("");
        setFindingDescription("");
        setFindingQueued(item.client_item_id);
      } catch (queueErr: any) {
        setFindingError(
          `This device cannot reach the server, and the finding could not be held locally either (${queueErr?.message || "the local queue refused the write"}). Nothing was saved.`
        );
      }
    } finally {
      setIsSavingFinding(false);
    }
  };

  /**
   * Ask the server to re-verify the sealed submission, now.
   *
   * `execution/verify/` recomputes both hashes from the stored content and
   * compares them with what was recorded at submission and sign-off. It is the
   * only place in the platform that answers "has this record been altered since
   * it was signed" without re-reading the whole execution record, and the
   * contract is narrow enough to state plainly: a 404 means this inspection has
   * no submission yet, which is not a verification failure and is reported as
   * its own thing.
   */
  const handleVerifyIntegrity = async () => {
    setIsCheckingIntegrity(true);
    setIntegrityError(null);
    try {
      setIntegrityCheck(await verifyInspectorExecution(inspectionId));
    } catch (err: any) {
      setIntegrityCheck(null);
      setIntegrityError(
        err?.response?.status === 404
          ? "The server holds no submission for this inspection, so there is nothing to verify."
          : messageOf(err, "The integrity check could not be run.")
      );
    } finally {
      setIsCheckingIntegrity(false);
    }
  };

  /**
   * Upload one captured file and register it as evidence for this visit.
   *
   * The device's own SHA-256 is computed and sent when the browser can compute
   * one, so the server refuses the upload if the bytes changed in transit. Where
   * it cannot — `crypto.subtle` is undefined outside a secure context — the
   * digest is simply not sent, and the server's own computation stands as the
   * record. The two cases are reported differently to the inspector rather than
   * being presented as the same result.
   */
  const handleUploadEvidence = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const files = Array.from(e.target.files ?? []);
    // Clear the input immediately: leaving it populated makes the same file
    // unselectable again, which reads as the upload button being broken.
    e.target.value = "";
    if (files.length === 0 || !inspection) return;

    setEvidenceError(null);
    setEvidenceNotice(null);
    setLastVerification(null);
    setIsUploadingEvidence(true);
    let uploaded = 0;
    let crossChecked = 0;
    try {
      for (const file of files) {
        setUploadProgress(0);
        const digest = await computeFileSha256(file);
        if (digest) crossChecked += 1;
        await uploadInspectorEvidence(
          {
            project: inspection.project,
            inspection: inspectionId,
            file,
            description: evidenceDescription.trim(),
            sha256: digest ?? undefined,
            capturedAt: new Date().toISOString(),
          },
          setUploadProgress
        );
        uploaded += 1;
      }
      await refreshEvidence();
      setEvidenceDescription("");
      setEvidenceNotice(
        `${uploaded} file${uploaded === 1 ? "" : "s"} stored in the evidence registry. ` +
          (crossChecked === uploaded
            ? "Each was cross-checked against this device's own SHA-256 and matched."
            : crossChecked === 0
            ? "The digest was computed by the server over the stored bytes; this browser cannot compute one to cross-check it, so the match is not independently attested."
            : `${crossChecked} of ${uploaded} were cross-checked against this device's own SHA-256; the server computed the digest for the rest.`)
      );
    } catch (err) {
      // A partial batch is reported as partial. Everything already stored stays
      // stored, and saying "upload failed" would misdescribe the registry.
      if (uploaded > 0) await refreshEvidence();
      setEvidenceError(
        `${uploaded > 0 ? `${uploaded} file${uploaded === 1 ? "" : "s"} stored before this failed. ` : ""}${messageOf(
          err,
          "The file could not be stored."
        )}`
      );
    } finally {
      setIsUploadingEvidence(false);
      setUploadProgress(0);
    }
  };

  /**
   * Re-read an artifact's bytes and re-hash them.
   *
   * The result is shown rather than swallowed: a `file_bytes_ok: false` is the
   * registry telling you the stored bytes are not the ones that were attested,
   * and that is precisely the finding this control exists to surface. It is a
   * 200, not an error, so the flags are read rather than the status code.
   */
  const handleVerifyEvidence = async (record: EvidenceRecordWithFile) => {
    setVerifyingId(record.id);
    setEvidenceError(null);
    setEvidenceNotice(null);
    setLastVerification(null);
    try {
      const result = await verifyInspectorEvidence(record.id);
      setLastVerification(result);
      await refreshEvidence();
    } catch (err) {
      setEvidenceError(messageOf(err, "Verification could not be run."));
    } finally {
      setVerifyingId(null);
    }
  };

  const handleSubmitExecution = async () => {
    setActionError(null);
    setNotice(null);
    setEvidenceError(null);
    setIsSubmitting(true);
    try {
      const position = await readDevicePosition();
      const checklist_results: ChecklistResultPayload[] = checklistRows.map(
        (row) => ({
          item_id: row.item_id,
          title: row.title,
          result: row.result,
          notes: row.notes,
          evidence_hashes: [],
        })
      );

      // Every artifact actually stored against this visit, with the digest the
      // server computed over the bytes it holds. Records with no file behind
      // them are left out — they cannot be sealed as artifacts, and the backend
      // refuses a submission carrying one without a checksum rather than
      // attesting to it.
      const evidence = evidenceRecords
        .map(toSubmissionEvidence)
        .filter((entry): entry is EvidenceFilePayload => entry !== null);

      await submitInspectorExecution(inspectionId, {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        gps_accuracy_m: Number.isFinite(position.coords.accuracy)
          ? position.coords.accuracy
          : null,
        checklist_results,
        evidence,
      });

      // The outcome and the field notes live on Inspection, outside the sealed
      // submission, so they need their own write. They are deliberately sent
      // AFTER the submission succeeds: if the submission is refused, nothing
      // about this inspection's outcome should have moved.
      let outcomeFailure: string | null = null;
      try {
        await saveInspectorOutcome(inspectionId, {
          outcome,
          summary_notes: summaryNotes,
        });
        setOutcomeSaved(true);
      } catch (err) {
        outcomeFailure = messageOf(err, "unknown error");
      }

      const state = await refreshExecution();

      if (outcomeFailure) {
        // Both facts are reported, because both are true: the sealed record
        // exists and the outcome does not. Saying only one of them would leave
        // the inspector believing something that is not the case.
        setActionError(
          `The execution record was submitted, but the outcome and field notes could not be saved: ${outcomeFailure}`
        );
        setNotice(
          `Execution record submitted${
            state?.submission?.submission_hash
              ? ` — SHA-256 ${state.submission.submission_hash.slice(0, 16)}…`
              : ""
          }. Sign off below to finalise.`
        );
      } else {
        setNotice(
          `Execution record submitted and outcome recorded${
            state?.submission?.submission_hash
              ? ` — SHA-256 ${state.submission.submission_hash.slice(0, 16)}…`
              : ""
          }. Sign off below to finalise.`
        );
      }
    } catch (err) {
      // No `catch { setSubmitSuccess(true); router.push(...) }`. The old code
      // showed "cryptographically signed and synchronized to state database!"
      // and navigated away on failure, so a rejected submission was
      // indistinguishable from an accepted one — and it claimed a signature
      // that this endpoint does not produce.
      setActionError(messageOf(err, "Submission failed."));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignOff = async () => {
    setActionError(null);
    setNotice(null);
    setIsSigningOff(true);
    try {
      const result = await signOffInspectorSubmission(inspectionId, signatureText);
      await refreshExecution();
      setNotice(
        `Signed off by ${result.signed_by} — SHA-256 ${result.signoff_hash.slice(0, 16)}…`
      );
    } catch (err) {
      setActionError(messageOf(err, "Sign-off failed."));
    } finally {
      setIsSigningOff(false);
    }
  };

  if (isLoading) {
    return (
      <div className="py-24 flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-[#022C4F] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // There is no fabricated fallback inspection. This page used to substitute
  // INS-2026-00412 / "Lekki Pearl Residences" / a Plot 14 Admiralty Way address
  // whenever the record could not be read, so a broken link rendered as a real
  // site with a real reference.
  if (loadError || !inspection || !execution) {
    return (
      <div className="space-y-6 animate-in fade-in duration-200 pb-12">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-[#022C4F] transition-colors cursor-pointer"
        >
          <ArrowLeft size={14} />
          <span>Back to Inspections</span>
        </button>
        <div className="p-6 rounded-2xl bg-amber-50 border border-amber-200">
          <h2 className="text-sm font-bold text-amber-900 mb-1">
            This inspection could not be loaded
          </h2>
          <p className="text-xs text-amber-800">
            {loadError || "The server returned no record for this inspection."}
          </p>
          <p className="text-xs text-amber-700 mt-2">
            Nothing is shown because nothing could be read. This is not an
            inspection with no details.
          </p>
        </div>
      </div>
    );
  }

  const insp = inspection;
  const verdict = geofenceVerdict(execution.geofence);
  const checkedIn = Boolean(execution.checkin_time);
  const checkedOut = Boolean(execution.check_out_time);
  const alreadySubmitted = Boolean(execution.submission);
  const alreadySignedOff = Boolean(execution.signoff);
  const undecidedItems = checklistRows.filter((r) => r.result === null);
  const noTemplate = checklistRows.length === 0;

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-200 pb-12 min-w-0">
      {/* Top Header */}
      <div className="flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-[#022C4F] transition-colors cursor-pointer"
        >
          <ArrowLeft size={14} />
          <span>Back to Inspections</span>
        </button>

        <span className="text-[11px] font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
          Ref: {orDash(insp.inspection_reference, "No reference")}
        </span>
      </div>

      {actionError && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
          <AlertCircle size={16} className="shrink-0 mt-0.5" />
          <span className="font-medium">{actionError}</span>
        </div>
      )}

      {notice && (
        <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 text-xs flex items-start gap-2">
          <CheckCircle2 size={16} className="shrink-0 mt-0.5" />
          <span className="font-medium">{notice}</span>
        </div>
      )}

      {/* Inspection Card Header */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Field Execution Protocol
            </div>
            <h1 className="text-2xl font-bold text-[#022C4F]">
              {orDash(insp.project_name, "Project not recorded")}
            </h1>
            <div className="text-xs text-slate-500 flex items-center gap-1.5 mt-1">
              <MapPin size={14} className="text-slate-400 shrink-0" />
              <span>{orDash(insp.project_location, "Site location not recorded")}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#022C4F] px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200">
              {orDash(insp.inspection_type, "Type not recorded")}
            </span>
            <span className="text-xs font-semibold text-slate-600 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200">
              {orDash(insp.status, "Status unknown")}
            </span>
          </div>
        </div>
      </div>

      {/* Step 1: Geofenced GPS Check-in */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                verdict.tone === "ok"
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : verdict.tone === "bad"
                  ? "bg-rose-50 text-rose-700 border border-rose-200"
                  : verdict.tone === "warn"
                  ? "bg-amber-50 text-amber-700 border border-amber-200"
                  : "bg-[#022C4F]/10 text-[#022C4F] border border-[#022C4F]/20"
              }`}
            >
              <MapPin size={20} />
            </div>
            <div>
              <h2 className="text-sm font-bold text-[#022C4F]">
                1. Geofenced Site Verification
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                {checkedIn
                  ? `Checked in ${dateTimeOr(execution.checkin_time, "at an unrecorded time")}.`
                  : "Check-in records your device's own position and the accuracy it reports, and the site geofence evaluates it."}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {checkedIn && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-50 text-slate-600 border border-slate-200 text-xs font-semibold">
                <Check size={14} />
                <span>Checked in</span>
              </span>
            )}
            {!checkedIn && (
              <button
                type="button"
                onClick={handleCheckin}
                disabled={isCheckingIn}
                className="px-4 py-2 rounded-xl bg-[#022C4F] hover:bg-[#022C4F]/90 text-white text-xs font-semibold transition-all shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isCheckingIn ? (
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Check size={14} />
                )}
                <span>Confirm GPS Check-in</span>
              </button>
            )}
            {checkedIn && !checkedOut && (
              <button
                type="button"
                onClick={handleCheckout}
                disabled={isCheckingOut}
                className="px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-[#022C4F] border border-slate-200 text-xs font-semibold transition-all shadow-sm flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {isCheckingOut ? (
                  <div className="w-3.5 h-3.5 border-2 border-[#022C4F] border-t-transparent rounded-full animate-spin" />
                ) : (
                  <LogOut size={14} />
                )}
                <span>Check Out of Site</span>
              </button>
            )}
            {checkedOut && (
              <span className="text-[11px] text-slate-500 font-medium">
                Checked out {dateTimeOr(execution.check_out_time, "at an unrecorded time")}
              </span>
            )}
          </div>
        </div>

        {/* The geofence verdict, with the radius and where it came from. The
            old page asserted "Location confirmed via GNSS coordinates (6.4474°
            N, 3.4842° E)" — a specific place, printed whether or not anything
            had been measured. */}
        <div className={`p-4 rounded-xl border text-xs ${TONE_CLASSES[verdict.tone]}`}>
          <div className="font-bold mb-1">{verdict.label}</div>
          <div className="leading-relaxed">{verdict.detail}</div>
          {checkedIn && (
            <div className="mt-2 pt-2 border-t border-black/10 flex flex-wrap gap-x-5 gap-y-1 font-mono text-[11px]">
              <span>
                Fix: {execution.gps_latitude ?? "—"}, {execution.gps_longitude ?? "—"}
              </span>
              <span>
                Accuracy:{" "}
                {typeof execution.gps_accuracy_m === "number"
                  ? `±${execution.gps_accuracy_m} m`
                  : "not reported"}
              </span>
              <span>
                Radius: {execution.geofence.radius_m} m (
                {execution.geofence.radius_source === "platform_default"
                  ? "platform default"
                  : "recorded on project"}
                )
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Step 2: Dynamic Discipline Checklist */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-bold text-[#022C4F]">
              2. Structural Verification Checklist
            </h2>
            <p className="text-xs text-slate-500">
              {execution.checklist
                ? `${execution.checklist.template_name} (${execution.checklist.version}) — ${checklistRows.length} item${
                    checklistRows.length === 1 ? "" : "s"
                  }.`
                : "No checklist template is active for this inspection type."}
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setFindingError(null);
              setFindingQueued(null);
              setIsFindingModalOpen(true);
            }}
            className="self-start sm:self-auto px-3.5 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-sm"
          >
            <AlertTriangle size={13} />
            <span>Log Defect</span>
          </button>
        </div>

        {findingQueued && (
          <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-900 flex items-start gap-2">
            <AlertCircle size={14} className="shrink-0 mt-0.5" />
            <div className="space-y-1">
              <div className="font-bold">
                Held on this device — not yet in the registry
              </div>
              <p className="leading-relaxed">
                The server could not be reached, so the finding was journaled on
                this device under{" "}
                <span className="font-mono">{findingQueued}</span> and is handed
                over the next time the queue is flushed. It is not in the
                statutory registry until that happens, and it will not appear in
                the findings list on any other screen until it is.
              </p>
              <Link
                href="/inspector/dashboard/sync"
                className="inline-block font-semibold text-amber-900 underline underline-offset-2"
              >
                Open Sync Status
              </Link>
            </div>
          </div>
        )}

        {noTemplate && (
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800">
            <div className="font-bold mb-1">No checklist is configured</div>
            <p className="leading-relaxed">
              The platform holds no active inspection template matching this
              inspection type, so there are no items to record against and the
              execution record cannot be submitted. An administrator needs to
              activate a template for this discipline. No placeholder checklist
              is shown in its place.
            </p>
          </div>
        )}

        <div className="space-y-2.5">
          {checklistRows.map((item) => (
            <div
              key={item.item_id}
              className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="text-xs font-semibold text-slate-800 max-w-xl leading-relaxed">
                {item.title}
                {item.required && (
                  <span className="ml-2 text-[10px] font-bold uppercase tracking-wider text-rose-600">
                    Required
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => handleToggleItemStatus(item.item_id, "PASS")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm ${
                    item.result === "PASS"
                      ? "bg-emerald-600 text-white"
                      : "bg-white text-slate-600 hover:text-slate-900 border border-slate-200"
                  }`}
                >
                  <Check size={13} />
                  <span>Pass</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleToggleItemStatus(item.item_id, "FAIL")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 shadow-sm ${
                    item.result === "FAIL"
                      ? "bg-rose-600 text-white"
                      : "bg-white text-slate-600 hover:text-slate-900 border border-slate-200"
                  }`}
                >
                  <X size={13} />
                  <span>Fail</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {!noTemplate && undecidedItems.length > 0 && (
          <p className="text-[11px] text-amber-700 font-medium">
            {undecidedItems.length} item
            {undecidedItems.length === 1 ? " has" : "s have"} no result recorded
            yet. They are submitted as undecided, which is a different statement
            from a pass.
          </p>
        )}
      </div>

      {/* Step 3: Evidence */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-bold text-[#022C4F]">
              3. Tamper-Evident Evidence Registry
            </h2>
            <p className="text-xs text-slate-500">
              Every attached artifact carries a SHA-256 digest sealed into the
              submission hash.
            </p>
          </div>
          {evidenceRecords.length > 0 && (
            <button
              type="button"
              onClick={() => void refreshEvidence()}
              disabled={isLoadingEvidence}
              className="self-start sm:self-auto px-3.5 py-1.5 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-sm disabled:opacity-50"
            >
              <Paperclip size={13} />
              <span>Re-read registry</span>
            </button>
          )}
        </div>

        {alreadySubmitted && (
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/70 text-xs">
            <span className="font-bold text-slate-800">
              {execution.submission!.evidence_files}
            </span>{" "}
            <span className="text-slate-600">
              artifact{execution.submission!.evidence_files === 1 ? "" : "s"} sealed
              into submission {execution.submission!.id.slice(0, 8)}…
            </span>
            {execution.submission!.evidence_files !==
              evidenceRecords.filter((r) => r.file?.sha256_hash).length && (
              <p className="mt-1.5 text-[11px] text-amber-700">
                The registry now holds{" "}
                {evidenceRecords.filter((r) => r.file?.sha256_hash).length} file
                {evidenceRecords.filter((r) => r.file?.sha256_hash).length === 1
                  ? ""
                  : "s"}{" "}
                for this visit. Anything uploaded after the submission was sealed
                is not part of that hash.
              </p>
            )}
          </div>
        )}

        {evidenceError && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
            <AlertCircle size={15} className="shrink-0 mt-0.5" />
            <span className="font-medium">{evidenceError}</span>
          </div>
        )}

        {evidenceNotice && (
          <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2">
            <CheckCircle2 size={15} className="shrink-0 mt-0.5" />
            <span className="font-medium">{evidenceNotice}</span>
          </div>
        )}

        {/* The last verification's answers, in full. `file_bytes_ok` is
            nullable, and the null case is shown as its own answer rather than
            folded into either pass or fail. */}
        {lastVerification && (
          <div
            className={`p-3.5 rounded-xl border text-xs space-y-1.5 ${
              lastVerification.file_bytes_ok === false ||
              !lastVerification.payload_ok
                ? TONE_CLASSES.bad
                : lastVerification.file_bytes_ok === null
                ? TONE_CLASSES.warn
                : TONE_CLASSES.ok
            }`}
          >
            <div className="font-bold">
              Verification of {lastVerification.evidence_reference}
            </div>
            <ul className="space-y-0.5 font-mono text-[11px]">
              <li>
                Payload hash matches:{" "}
                {lastVerification.payload_ok ? "yes" : "NO"}
              </li>
              <li>
                File present: {lastVerification.file_present ? "yes" : "NO"}
              </li>
              <li>
                Stored bytes match the digest:{" "}
                {lastVerification.file_bytes_ok === null
                  ? "not checked"
                  : lastVerification.file_bytes_ok
                  ? "yes"
                  : "NO"}
              </li>
              {lastVerification.file_sha256 && (
                <li className="break-all">
                  Re-read digest: {lastVerification.file_sha256}
                </li>
              )}
            </ul>
            {lastVerification.note && (
              <p className="not-italic">{lastVerification.note}</p>
            )}
            <p className="opacity-80">
              Re-read at {dateTimeOr(lastVerification.verified_at, "an unrecorded time")}.
            </p>
          </div>
        )}

        {isLoadingEvidence ? (
          <div className="py-8 flex items-center justify-center">
            <div className="w-5 h-5 border-2 border-[#022C4F] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : evidenceListError ? (
          <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800">
            <div className="font-bold mb-1">
              The evidence registry could not be read
            </div>
            <p className="leading-relaxed">
              {evidenceListError} Nothing is listed because nothing could be
              read — which is not the same as this visit having no evidence, and
              submitting now would seal a record that states zero artifacts.
            </p>
          </div>
        ) : evidenceRecords.length === 0 ? (
          <div className="p-4 rounded-xl bg-slate-50 border border-dashed border-slate-300 text-xs text-slate-600">
            <div className="font-bold text-slate-700 mb-1">
              No evidence is attached
            </div>
            <p className="leading-relaxed">
              The registry holds nothing against this visit. A submission sent
              now states zero evidence files, which is true. This page previously
              listed two files with truncated invented digests and a
              &ldquo;Verified&rdquo; badge for captures that were never taken.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {evidenceRecords.map((record) => {
              const file = record.file;
              const verdict = verifyVerdict(file);
              const VerdictIcon = verdict.icon;
              return (
                <div
                  key={record.id}
                  className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 space-y-2"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-slate-800 break-all">
                        {file?.file_name || record.source_type_display}
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {record.evidence_reference} · {formatBytes(file?.file_size_bytes ?? null)}
                        {file?.content_type ? ` · ${file.content_type}` : ""}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-semibold ${
                          TONE_CLASSES[verdict.tone]
                        }`}
                      >
                        <VerdictIcon size={12} />
                        <span>{verdict.label}</span>
                      </span>
                      {file && !alreadySubmitted && (
                        <button
                          type="button"
                          onClick={() => void handleVerifyEvidence(record)}
                          disabled={verifyingId === record.id}
                          className="px-3 py-1 rounded-lg bg-white hover:bg-slate-100 text-[#022C4F] border border-slate-200 text-[11px] font-semibold transition-colors cursor-pointer shadow-sm disabled:opacity-50"
                        >
                          {verifyingId === record.id ? "Verifying…" : "Verify"}
                        </button>
                      )}
                    </div>
                  </div>

                  {file?.sha256_hash && (
                    <div className="font-mono text-[11px] text-slate-600 break-all">
                      SHA-256 {file.sha256_hash}
                    </div>
                  )}

                  {file && file.last_verify_ok === false && file.last_verify_note && (
                    <div className="text-[11px] text-rose-700">
                      {file.last_verify_note}
                    </div>
                  )}

                  {file && file.last_verified_at && (
                    <div className="text-[11px] text-slate-500">
                      Last checked {dateTimeOr(file.last_verified_at, "at an unrecorded time")}
                      {file.file_url === null
                        ? " · this deployment cannot hand out a link to the stored bytes"
                        : ""}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {!alreadySubmitted && (
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 space-y-3">
            <div>
              <label
                htmlFor="evidence-description"
                className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5"
              >
                What this capture shows (optional)
              </label>
              <input
                id="evidence-description"
                type="text"
                value={evidenceDescription}
                onChange={(e) => setEvidenceDescription(e.target.value)}
                placeholder="e.g. North face of column C24 after formwork strike"
                className="w-full p-2.5 rounded-xl bg-white border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#022C4F]"
              />
            </div>

            <label
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#022C4F] hover:bg-[#022C4F]/90 text-white text-xs font-semibold transition-all shadow-sm cursor-pointer ${
                isUploadingEvidence ? "opacity-50 pointer-events-none" : ""
              }`}
            >
              <Paperclip size={14} />
              <span>
                {isUploadingEvidence
                  ? `Uploading… ${Math.round(uploadProgress * 100)}%`
                  : "Attach photos or instrument exports"}
              </span>
              <input
                type="file"
                multiple
                className="hidden"
                disabled={isUploadingEvidence}
                onChange={handleUploadEvidence}
              />
            </label>

            <p className="text-[11px] text-slate-500 leading-relaxed flex items-start gap-1.5">
              <Info size={12} className="shrink-0 mt-0.5" />
              <span>
                Each file is stored in the registry and its digest computed over
                the bytes the server received. Where this browser can compute a
                digest of its own, it is sent with the upload and the server
                refuses the file if the two disagree — so a capture corrupted in
                transit is caught rather than attested. Uploads cannot be
                withdrawn from the app; the registry is append-only by design.
              </span>
            </p>
          </div>
        )}
      </div>

      {/* Step 4: Outcome, Submission & Sign-Off */}
      <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-sm space-y-4">
        <h2 className="text-sm font-bold text-[#022C4F]">
          4. Final Assessment &amp; Digital Sign-off
        </h2>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2">
            Inspection Outcome Decision
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { id: "PASSED", label: "Clear / Passed", color: "border-emerald-300 bg-emerald-50 text-emerald-800" },
              { id: "CONDITIONAL_PASS", label: "Conditional Pass", color: "border-amber-300 bg-amber-50 text-amber-800" },
              { id: "FAILED", label: "Failed / Violations Found", color: "border-rose-300 bg-rose-50 text-rose-800" },
            ].map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => {
                  setOutcome(opt.id as any);
                  setOutcomeSaved(false);
                }}
                className={`p-3 rounded-xl border text-xs font-bold text-center transition-all cursor-pointer shadow-sm ${
                  outcome === opt.id
                    ? `${opt.color} ring-2 ring-[#022C4F]`
                    : "border-slate-200 bg-slate-50 text-slate-600 hover:bg-slate-100"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <p className="text-[11px] text-slate-500 mt-2">
            {outcomeSaved
              ? "Recorded against this inspection."
              : "Not yet recorded against this inspection."}
          </p>
        </div>

        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-2">
            Official Inspector Field Summary Notes
          </label>
          <textarea
            rows={3}
            value={summaryNotes}
            onChange={(e) => {
              setSummaryNotes(e.target.value);
              setOutcomeSaved(false);
            }}
            placeholder="Record technical observations, required corrective remedies, or re-inspection requirements..."
            className="w-full p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#022C4F]"
          />
        </div>

        {execution.submission && (
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-slate-800">
              <Hash size={14} />
              <span>Execution record sealed</span>
            </div>
            <div className="font-mono text-[11px] text-slate-600 break-all">
              {execution.submission.submission_hash}
            </div>
            <div className="text-slate-600">
              {execution.submission.items} checklist row
              {execution.submission.items === 1 ? "" : "s"},{" "}
              {execution.submission.evidence_files} evidence file
              {execution.submission.evidence_files === 1 ? "" : "s"}, submitted{" "}
              {dateTimeOr(execution.submission.submitted_at, "at an unrecorded time")}.
            </div>
            {/* Recomputed from stored content by the server on this very read —
                a real verification, unlike the "100% SHA-256 Verified" literal
                that used to sit on the dashboard. */}
            <div
              className={`font-semibold ${
                execution.submission.integrity_verified
                  ? "text-emerald-700"
                  : "text-rose-700"
              }`}
            >
              Integrity re-check:{" "}
              {execution.submission.integrity_verified
                ? "hash matches the stored content"
                : "HASH DOES NOT MATCH — the stored record has been altered"}
            </div>
          </div>
        )}

        {execution.signoff && (
          <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-emerald-900">
              <PenLine size={14} />
              <span>Signed off by {execution.signoff.signed_by}</span>
            </div>
            <div className="font-mono text-[11px] text-emerald-800 break-all">
              {execution.signoff.signoff_hash}
            </div>
            <div className="text-emerald-800">
              Signed {dateTimeOr(execution.signoff.signed_at, "at an unrecorded time")}. Signature
              re-check:{" "}
              {execution.signoff.signature_verified
                ? "valid"
                : "DOES NOT MATCH the stored submission"}
              .
            </div>
          </div>
        )}

        {alreadySubmitted && (
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <div className="text-xs font-bold text-[#022C4F]">
                  Independent integrity check
                </div>
                <p className="text-[11px] text-slate-500">
                  Recomputes the submission and sign-off hashes from the stored
                  record and compares them with what was sealed. Run it now
                  rather than reading the value this page loaded with.
                </p>
              </div>
              <button
                type="button"
                onClick={() => void handleVerifyIntegrity()}
                disabled={isCheckingIntegrity}
                className="px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-[#022C4F] border border-slate-200 text-xs font-semibold transition-colors shadow-sm cursor-pointer disabled:opacity-50 shrink-0"
              >
                {isCheckingIntegrity ? "Checking…" : "Re-check integrity"}
              </button>
            </div>

            {integrityError && (
              <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-[11px] text-amber-800">
                {integrityError}
              </div>
            )}

            {integrityCheck && (
              <div className="space-y-2">
                <div
                  className={`text-[11px] font-semibold ${
                    integrityCheck.submission_valid
                      ? "text-emerald-700"
                      : "text-rose-700"
                  }`}
                >
                  Submission:{" "}
                  {integrityCheck.submission_valid
                    ? "the stored record still hashes to the sealed digest"
                    : "THE STORED RECORD NO LONGER HASHES TO THE SEALED DIGEST — it has been altered since it was submitted"}
                </div>
                <div className="font-mono text-[10px] text-slate-500 break-all">
                  sealed {integrityCheck.submission_hash}
                </div>
                {integrityCheck.signoff_hash !== undefined && (
                  <>
                    <div
                      className={`text-[11px] font-semibold ${
                        integrityCheck.signoff_valid
                          ? "text-emerald-700"
                          : "text-rose-700"
                      }`}
                    >
                      Sign-off:{" "}
                      {integrityCheck.signoff_valid
                        ? "valid against the stored submission"
                        : "DOES NOT MATCH the stored submission"}
                    </div>
                    <div className="font-mono text-[10px] text-slate-500 break-all">
                      sealed {integrityCheck.signoff_hash}
                    </div>
                  </>
                )}
                {integrityCheck.signoff_hash === undefined && (
                  <div className="text-[11px] text-slate-500">
                    This submission carries no sign-off, so there is nothing
                    further to verify. It is not a failed check.
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {!alreadySubmitted && (
          <>
            {!checkedIn && (
              <p className="text-[11px] font-medium text-amber-700">
                Check in before submitting — a submission without a recorded
                check-in has no verified site presence, and the server will
                refuse it.
              </p>
            )}
            <button
              type="button"
              onClick={handleSubmitExecution}
              disabled={isSubmitting || !checkedIn || noTemplate}
              className="w-full h-12 rounded-xl bg-[#022C4F] hover:bg-[#022C4F]/90 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Send size={15} />
                  <span>Submit Execution Record</span>
                </>
              )}
            </button>
          </>
        )}

        {alreadySubmitted && !alreadySignedOff && (
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1.5">
                Signature Declaration
              </label>
              <input
                type="text"
                value={signatureText}
                onChange={(e) => setSignatureText(e.target.value)}
                placeholder="I confirm this inspection was executed at the recorded location and time."
                className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-3.5 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#022C4F]"
              />
            </div>
            <button
              type="button"
              onClick={handleSignOff}
              disabled={isSigningOff}
              className="w-full h-12 rounded-xl bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSigningOff ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <PenLine size={15} />
                  <span>Sign Off Inspection</span>
                </>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Log Finding Modal */}
      {isFindingModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white border border-slate-200 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-[#022C4F] flex items-center gap-2">
                <AlertTriangle size={16} className="text-rose-500" />
                <span>Log Non-Conformance Finding</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsFindingModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleAddFinding} className="space-y-4">
              {findingError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2">
                  <AlertCircle size={14} className="shrink-0 mt-0.5" />
                  <span>{findingError}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Defect / Violation Title
                </label>
                <input
                  type="text"
                  value={findingTitle}
                  onChange={(e) => setFindingTitle(e.target.value)}
                  placeholder="e.g. Inadequate rebar cover on Column C-24"
                  required
                  className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-3.5 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#022C4F]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Severity Level
                </label>
                <select
                  value={findingSeverity}
                  onChange={(e) => setFindingSeverity(e.target.value as any)}
                  className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl px-3.5 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#022C4F]"
                >
                  <option value="CRITICAL">Critical (Statutory Stop-Work Eligible)</option>
                  <option value="HIGH">High Severity</option>
                  <option value="MEDIUM">Medium Severity</option>
                  <option value="LOW">Low Severity</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 mb-1">
                  Corrective Remedy
                </label>
                <textarea
                  rows={3}
                  value={findingDescription}
                  onChange={(e) => setFindingDescription(e.target.value)}
                  placeholder="Describe required remedy before next concrete pour..."
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#022C4F]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsFindingModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSavingFinding}
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold shadow-sm cursor-pointer disabled:opacity-50"
                >
                  {isSavingFinding ? "Saving…" : "Save Finding"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
