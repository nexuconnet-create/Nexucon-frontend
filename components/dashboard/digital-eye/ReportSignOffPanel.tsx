"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { BadgeCheck, PenLine, RefreshCw, Save, Trash2, Upload } from "lucide-react";
import {
  getReportSignOff,
  removeReportSignOff,
  updateReportSignOff,
  type ReportSignOffConfig,
} from "@/services/digitalEye";

/**
 * Approving-engineer sign-off panel (C11, 4 Sep meeting): record the
 * COREN-registered engineer who gives final input on the project's statutory
 * NDT report (client principle 5). Every field is typed by a Director —
 * nothing is seeded, nothing is derived. With no credentials recorded the
 * report's sign-off block simply leaves those lines blank, exactly as
 * before. Directors only (enforced server-side).
 */
export default function ReportSignOffPanel({ projectId }: { projectId?: string }) {
  const [config, setConfig] = useState<ReportSignOffConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [approvedBy, setApprovedBy] = useState("");
  const [qualification, setQualification] = useState("");
  const [corenNo, setCorenNo] = useState("");
  const [firmName, setFirmName] = useState("");
  const [signatureFile, setSignatureFile] = useState<File | null>(null);

  const signatureInputRef = useRef<HTMLInputElement>(null);

  const errText = useCallback((err: any): string => {
    return (
      err?.response?.data?.detail ||
      err?.message ||
      "The request failed."
    );
  }, []);

  const load = useCallback(async () => {
    if (!projectId) {
      setLoading(false);
      setConfig(null);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await getReportSignOff(projectId);
      setConfig(data);
      if (data.signoff_configured) {
        setApprovedBy(data.approved_by_name || "");
        setQualification(data.qualification || "");
        setCorenNo(data.coren_registration_no || "");
        setFirmName(data.firm_name || "");
      }
    } catch (err: any) {
      setError(errText(err));
      setConfig(null);
    } finally {
      setLoading(false);
    }
  }, [projectId, errText]);

  useEffect(() => {
    load();
  }, [load]);

  const toast = (message: string, type: "success" | "error" | "info") => {
    window.dispatchEvent(
      new CustomEvent("show-toast", { detail: { message, type } }),
    );
  };

  const pickSignature = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (!file) return;
    if (!["image/png", "image/jpeg"].includes(file.type)) {
      toast("⚠️ Signature image: PNG or JPEG images only.", "error");
      e.target.value = "";
      return;
    }
    setSignatureFile(file);
  };

  const handleSave = async () => {
    if (!projectId) return;
    // A meaningful change must be present — a text field that differs from
    // what is stored, or a new signature image.
    const fields: Parameters<typeof updateReportSignOff>[1] = {};
    if (approvedBy !== (config?.approved_by_name || "")) fields.approved_by_name = approvedBy.trim();
    if (qualification !== (config?.qualification || "")) fields.qualification = qualification.trim();
    if (corenNo !== (config?.coren_registration_no || "")) fields.coren_registration_no = corenNo.trim();
    if (firmName !== (config?.firm_name || "")) fields.firm_name = firmName.trim();
    if (signatureFile) fields.signature_image = signatureFile;
    if (Object.keys(fields).length === 0) {
      toast("Nothing to save — change a field or upload a signature image.", "info");
      return;
    }
    setSaving(true);
    try {
      const data = await updateReportSignOff(projectId, fields);
      setConfig(data);
      setSignatureFile(null);
      if (signatureInputRef.current) signatureInputRef.current.value = "";
      toast("Sign-off credentials saved — the next report renders them on the sign-off page.", "success");
    } catch (err: any) {
      toast(`⚠️ ${errText(err)}`, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveSignature = async () => {
    if (!projectId) return;
    setSaving(true);
    try {
      const data = await updateReportSignOff(projectId, { signature_image: "remove" });
      setConfig(data);
      toast("Signature image removed.", "success");
    } catch (err: any) {
      toast(`⚠️ ${errText(err)}`, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveAll = async () => {
    if (!projectId) return;
    setSaving(true);
    try {
      const data = await removeReportSignOff(projectId);
      setConfig(data);
      setApprovedBy("");
      setQualification("");
      setCorenNo("");
      setFirmName("");
      setSignatureFile(null);
      if (signatureInputRef.current) signatureInputRef.current.value = "";
      toast(
        "Sign-off credentials removed — the report reverts to blank sign-off lines.",
        "success",
      );
    } catch (err: any) {
      toast(`⚠️ ${errText(err)}`, "error");
    } finally {
      setSaving(false);
    }
  };

  if (!projectId) {
    return (
      <section className="rounded-xl border border-slate-200 bg-white p-5 text-sm text-[#4B5B66]">
        <h3 className="font-semibold text-[#0F181F] mb-1 flex items-center gap-2">
          <BadgeCheck className="w-4 h-4" /> Engineer Sign-Off
        </h3>
        Select a project to record its approving engineer&apos;s credentials.
      </section>
    );
  }

  if (loading) {
    return (
      <section className="rounded-xl border border-slate-200 bg-white p-5 text-sm text-[#4B5B66] flex items-center gap-2" role="status">
        <RefreshCw className="w-4 h-4 animate-spin" /> Loading sign-off credentials…
      </section>
    );
  }

  const labelCls = "block text-xs font-medium text-[#4B5B66] mb-1";
  const inputCls =
    "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-[#0F181F] focus:outline-none focus:ring-2 focus:ring-[#0A3D2E]/30";

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5" aria-label="Engineer sign-off">
      <h3 className="font-semibold text-[#0F181F] mb-1 flex items-center gap-2">
        <BadgeCheck className="w-4 h-4" /> Engineer Sign-Off (COREN)
      </h3>
      <p className="text-xs text-[#6B7A85] mb-4 leading-relaxed">
        Record the COREN-registered engineer who gives final input on this
        project&apos;s statutory NDT report — printed as ruled credential lines
        beside the signature block. Credentials are stored server-side and
        rendered verbatim into the certified PDF; with nothing recorded the
        report keeps its blank sign-off lines, exactly as before. Director-level
        role required to change.
      </p>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700" role="alert">
          {error}
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-5">
        <div>
          <label className={labelCls} htmlFor="signoff-approved-by">
            Approved by (name)
          </label>
          <input
            id="signoff-approved-by"
            type="text"
            value={approvedBy}
            onChange={(e) => setApprovedBy(e.target.value)}
            maxLength={150}
            placeholder="e.g. Engr. A. B. Mohammed"
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls} htmlFor="signoff-qualification">
            Professional qualification
          </label>
          <input
            id="signoff-qualification"
            type="text"
            value={qualification}
            onChange={(e) => setQualification(e.target.value)}
            maxLength={150}
            placeholder="e.g. B.Sc (Eng), M.Sc, MNSE, COREN-registered"
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls} htmlFor="signoff-coren-no">
            COREN registration no.
          </label>
          <input
            id="signoff-coren-no"
            type="text"
            value={corenNo}
            onChange={(e) => setCorenNo(e.target.value)}
            maxLength={60}
            placeholder="e.g. R.20234"
            className={inputCls}
          />
        </div>
        <div>
          <label className={labelCls} htmlFor="signoff-firm">
            Company / firm
          </label>
          <input
            id="signoff-firm"
            type="text"
            value={firmName}
            onChange={(e) => setFirmName(e.target.value)}
            maxLength={150}
            placeholder="e.g. Nexucon Engineering Ltd."
            className={inputCls}
          />
        </div>
      </div>

      <div className="mt-5">
        <label className={labelCls} htmlFor="signoff-signature-upload">
          <span className="inline-flex items-center gap-1">
            <PenLine className="w-3.5 h-3.5" /> Signature image (optional, PNG / JPEG)
          </span>
        </label>
        <input
          ref={signatureInputRef}
          id="signoff-signature-upload"
          type="file"
          accept="image/png,image/jpeg"
          onChange={pickSignature}
          className="block w-full text-xs text-[#4B5B66] file:mr-3 file:rounded-lg file:border-0 file:bg-[#0A3D2E] file:px-3 file:py-2 file:text-xs file:font-medium file:text-white hover:file:bg-[#0A3D2E]/90"
        />
        {signatureFile && (
          <p className="mt-1 text-xs text-emerald-700">
            Pending upload: {signatureFile.name}
          </p>
        )}
        {config?.signoff_configured && config.signature_image_url && (
          <div className="mt-2 flex items-center gap-3">
            {/* Real stored preview, served by the backend */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={config.signature_image_url}
              alt="Saved engineer signature"
              className="h-10 w-auto rounded border border-slate-200 bg-white p-1"
            />
            <button
              type="button"
              onClick={handleRemoveSignature}
              disabled={saving}
              className="inline-flex items-center gap-1 text-xs text-red-600 hover:underline disabled:opacity-50"
            >
              <Trash2 className="w-3.5 h-3.5" /> Remove signature
            </button>
          </div>
        )}
      </div>

      <div className="mt-5 flex items-center gap-3">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-lg bg-[#0A3D2E] px-4 py-2 text-sm font-medium text-white hover:bg-[#0A3D2E]/90 disabled:opacity-50"
        >
          {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? "Saving…" : "Save sign-off"}
        </button>
        {config?.signoff_configured && (
          <button
            type="button"
            onClick={handleRemoveAll}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" /> Remove all credentials
          </button>
        )}
        <span className="hidden sm:inline-flex items-center gap-1 text-xs text-[#6B7A85]">
          <Upload className="w-3 h-3" /> Nothing is auto-filled — every line is as recorded.
        </span>
      </div>
    </section>
  );
}
