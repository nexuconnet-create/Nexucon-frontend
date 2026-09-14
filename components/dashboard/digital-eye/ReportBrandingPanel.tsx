"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { Image as ImageIcon, RefreshCw, Trash2, Upload } from "lucide-react";
import {
  getReportBranding,
  removeReportBranding,
  updateReportBranding,
  type ReportBrandingConfig,
} from "@/services/digitalEye";

/**
 * Report branding panel (REFINED EXECUTIVE SUMMARY §2.3): upload a client /
 * consultant logo and an optional watermark for the project's statutory NDT
 * report, with position / size / opacity controls and a live preview of the
 * saved state. Every image is a real uploaded file persisted by the backend;
 * nothing is seeded, and with no branding configured the report keeps the
 * standard laboratory layout. Directors only (enforced server-side).
 */
export default function ReportBrandingPanel({ projectId }: { projectId?: string }) {
  const [config, setConfig] = useState<ReportBrandingConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [watermarkFile, setWatermarkFile] = useState<File | null>(null);
  const [coverLogoFile, setCoverLogoFile] = useState<File | null>(null);
  const [coverLogoHidden, setCoverLogoHidden] = useState(false);
  const [logoPosition, setLogoPosition] = useState("top-right");
  const [logoSize, setLogoSize] = useState("medium");
  const [watermarkOpacity, setWatermarkOpacity] = useState(50);
  const [watermarkPosition, setWatermarkPosition] = useState("center");

  const logoInputRef = useRef<HTMLInputElement>(null);
  const watermarkInputRef = useRef<HTMLInputElement>(null);
  const coverLogoInputRef = useRef<HTMLInputElement>(null);

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
      const data = await getReportBranding(projectId);
      setConfig(data);
      if (data.branding_configured) {
        setLogoPosition(data.logo_position || "top-right");
        setLogoSize(data.logo_size || "medium");
        setCoverLogoHidden(!!data.cover_logo_hidden);
        setWatermarkOpacity(data.watermark_opacity_pct ?? 50);
        setWatermarkPosition(data.watermark_position || "center");
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

  const pickImage = (
    e: React.ChangeEvent<HTMLInputElement>,
    set: (f: File | null) => void,
    label: string,
  ) => {
    const file = e.target.files?.[0] || null;
    if (!file) return;
    if (!["image/png", "image/jpeg"].includes(file.type)) {
      toast(`⚠️ ${label}: PNG or JPEG images only.`, "error");
      e.target.value = "";
      return;
    }
    set(file);
  };

  const handleSave = async () => {
    if (!projectId) return;
    // A meaningful change must be present — file, removal, or a scalar.
    const scalars: Record<string, string | number | boolean> = {};
    if (config?.branding_configured) {
      if (logoPosition !== config.logo_position) scalars.logo_position = logoPosition;
      if (logoSize !== config.logo_size) scalars.logo_size = logoSize;
      if (coverLogoHidden !== !!config.cover_logo_hidden)
        scalars.cover_logo_hidden = coverLogoHidden;
      if (watermarkOpacity !== config.watermark_opacity_pct)
        scalars.watermark_opacity_pct = watermarkOpacity;
      if (watermarkPosition !== config.watermark_position)
        scalars.watermark_position = watermarkPosition;
    } else {
      scalars.logo_position = logoPosition;
      scalars.logo_size = logoSize;
      scalars.watermark_opacity_pct = watermarkOpacity;
      scalars.watermark_position = watermarkPosition;
      // Only send the hide flag on a first save when the user actually
      // wants no cover logo (the default coat of arms otherwise stays).
      if (coverLogoHidden) scalars.cover_logo_hidden = true;
    }
    if (
      !logoFile &&
      !watermarkFile &&
      !coverLogoFile &&
      Object.keys(scalars).length === 0
    ) {
      toast("Nothing to save — upload an image or change a setting.", "info");
      return;
    }
    setSaving(true);
    try {
      const fields: Parameters<typeof updateReportBranding>[1] = { ...scalars };
      if (logoFile) fields.logo = logoFile;
      if (watermarkFile) fields.watermark = watermarkFile;
      if (coverLogoFile) fields.cover_logo = coverLogoFile;
      const data = await updateReportBranding(projectId, fields);
      setConfig(data);
      setLogoFile(null);
      setWatermarkFile(null);
      setCoverLogoFile(null);
      if (logoInputRef.current) logoInputRef.current.value = "";
      if (watermarkInputRef.current) watermarkInputRef.current.value = "";
      if (coverLogoInputRef.current) coverLogoInputRef.current.value = "";
      toast("Report branding saved — the next report renders with it.", "success");
    } catch (err: any) {
      toast(`⚠️ ${errText(err)}`, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveImage = async (field: "logo" | "watermark" | "cover_logo") => {
    if (!projectId) return;
    setSaving(true);
    try {
      const fields: Parameters<typeof updateReportBranding>[1] =
        field === "cover_logo"
          ? { cover_logo: "remove", cover_logo_hidden: false }
          : { [field]: "remove" };
      const data = await updateReportBranding(projectId, fields);
      setConfig(data);
      toast(
        field === "logo"
          ? "Logo removed."
          : field === "watermark"
            ? "Watermark removed."
            : "Custom cover logo removed — the default coat of arms returns.",
        "success",
      );
    } catch (err: any) {
      toast(`⚠️ ${errText(err)}`, "error");
    } finally {
      setSaving(false);
    }
  };

  /** Show/hide the cover logo immediately (hiding also drops any custom
   *  image server-side; showing restores the default coat of arms). */
  const handleToggleCoverLogo = async (hidden: boolean) => {
    if (!projectId) return;
    setCoverLogoHidden(hidden);
    setSaving(true);
    try {
      const data = await updateReportBranding(projectId, {
        cover_logo_hidden: hidden,
      });
      setConfig(data);
      toast(
        hidden
          ? "Cover logo hidden — the next report cover carries no logo."
          : "Cover logo restored — the default coat of arms renders on the cover.",
        "success",
      );
    } catch (err: any) {
      // Revert the toggle on failure so the control shows the truth.
      setCoverLogoHidden(!hidden);
      toast(`⚠️ ${errText(err)}`, "error");
    } finally {
      setSaving(false);
    }
  };

  const handleRemoveAll = async () => {
    if (!projectId) return;
    setSaving(true);
    try {
      const data = await removeReportBranding(projectId);
      setConfig(data);
      toast(
        "Branding removed — the report reverts to the standard laboratory layout.",
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
          <ImageIcon className="w-4 h-4" /> Report Branding
        </h3>
        Select a project to configure its report logo and watermark.
      </section>
    );
  }

  if (loading) {
    return (
      <section className="rounded-xl border border-slate-200 bg-white p-5 text-sm text-[#4B5B66] flex items-center gap-2" role="status">
        <RefreshCw className="w-4 h-4 animate-spin" /> Loading branding…
      </section>
    );
  }

  const labelCls = "block text-xs font-medium text-[#4B5B66] mb-1";
  const selectCls =
    "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-[#0F181F] focus:outline-none focus:ring-2 focus:ring-[#0A3D2E]/30";

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5" aria-label="Report branding">
      <h3 className="font-semibold text-[#0F181F] mb-1 flex items-center gap-2">
        <ImageIcon className="w-4 h-4" /> Report Branding
      </h3>
      <p className="text-xs text-[#6B7A85] mb-4 leading-relaxed">
        Stamp your organisation&apos;s logo (and an optional watermark) onto this
        project&apos;s statutory NDT report cover. Images are stored
        server-side and rendered into the certified PDF at generation time.
        With nothing configured, the standard laboratory layout is used.
        Director-level role required to change.
      </p>

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700" role="alert">
          {error}
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-5">
        {/* Logo ---------------------------------------------------------- */}
        <div>
          <label className={labelCls} htmlFor="branding-logo-upload">Logo (PNG / JPEG)</label>
          <input
            ref={logoInputRef}
            id="branding-logo-upload"
            type="file"
            accept="image/png,image/jpeg"
            onChange={(e) => pickImage(e, setLogoFile, "Logo")}
            className="block w-full text-xs text-[#4B5B66] file:mr-3 file:rounded-lg file:border-0 file:bg-[#0A3D2E] file:px-3 file:py-2 file:text-xs file:font-medium file:text-white hover:file:bg-[#0A3D2E]/90"
          />
          {logoFile && (
            <p className="mt-1 text-xs text-emerald-700">
              Pending upload: {logoFile.name}
            </p>
          )}
          {config?.branding_configured && config.logo_url && (
            <div className="mt-2 flex items-center gap-3">
              {/* Real stored preview, served by the backend */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={config.logo_url}
                alt="Saved report logo"
                className="h-10 w-auto rounded border border-slate-200 bg-white p-1"
              />
              <button
                type="button"
                onClick={() => handleRemoveImage("logo")}
                disabled={saving}
                className="inline-flex items-center gap-1 text-xs text-red-600 hover:underline disabled:opacity-50"
              >
                <Trash2 className="w-3.5 h-3.5" /> Remove logo
              </button>
            </div>
          )}

          <div className="mt-3 grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls} htmlFor="logo-position">Position</label>
              <select
                id="logo-position"
                value={logoPosition}
                onChange={(e) => setLogoPosition(e.target.value)}
                className={selectCls}
              >
                <option value="top-left">Top left</option>
                <option value="top-right">Top right</option>
                <option value="bottom-left">Bottom left</option>
                <option value="bottom-right">Bottom right</option>
              </select>
            </div>
            <div>
              <label className={labelCls} htmlFor="logo-size">Size</label>
              <select
                id="logo-size"
                value={logoSize}
                onChange={(e) => setLogoSize(e.target.value)}
                className={selectCls}
              >
                <option value="small">Small (20 mm)</option>
                <option value="medium">Medium (30 mm)</option>
                <option value="large">Large (42 mm)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Cover logo ---------------------------------------------------- */}
        <div>
          <label className={labelCls} htmlFor="branding-cover-logo-upload">
            Cover Logo — replaces the Lagos State coat of arms (PNG / JPEG)
          </label>
          <input
            ref={coverLogoInputRef}
            id="branding-cover-logo-upload"
            type="file"
            accept="image/png,image/jpeg"
            onChange={(e) => pickImage(e, setCoverLogoFile, "Cover logo")}
            className="block w-full text-xs text-[#4B5B66] file:mr-3 file:rounded-lg file:border-0 file:bg-[#0A3D2E] file:px-3 file:py-2 file:text-xs file:font-medium file:text-white hover:file:bg-[#0A3D2E]/90"
          />
          {coverLogoFile && (
            <p className="mt-1 text-xs text-emerald-700">
              Pending upload: {coverLogoFile.name}
            </p>
          )}
          {config?.branding_configured && config.cover_logo_url && (
            <div className="mt-2 flex items-center gap-3">
              {/* Real stored preview, served by the backend */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={config.cover_logo_url}
                alt="Saved cover logo"
                className="h-10 w-auto rounded border border-slate-200 bg-white p-1"
              />
              <button
                type="button"
                onClick={() => handleRemoveImage("cover_logo")}
                disabled={saving}
                className="inline-flex items-center gap-1 text-xs text-red-600 hover:underline disabled:opacity-50"
              >
                <Trash2 className="w-3.5 h-3.5" /> Remove — revert to default
              </button>
            </div>
          )}

          <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
            <label className="flex items-start gap-2 text-xs text-[#4B5B66]">
              <input
                id="cover-logo-hidden"
                type="checkbox"
                checked={coverLogoHidden}
                onChange={(e) => handleToggleCoverLogo(e.target.checked)}
                disabled={saving || (!config?.branding_configured && !coverLogoFile)}
                className="mt-0.5 accent-[#0A3D2E]"
              />
              <span>
                <span className="font-medium text-[#0F181F]">
                  No cover logo at all
                </span>{" "}
                — hide the cover logo entirely (the default coat of arms is
                not drawn either). Uncheck to restore it.
              </span>
            </label>
          </div>
        </div>

        {/* Watermark ----------------------------------------------------- */}
        <div>
          <label className={labelCls} htmlFor="branding-watermark-upload">
            Watermark (optional, PNG / JPEG)
          </label>
          <input
            ref={watermarkInputRef}
            id="branding-watermark-upload"
            type="file"
            accept="image/png,image/jpeg"
            onChange={(e) => pickImage(e, setWatermarkFile, "Watermark")}
            className="block w-full text-xs text-[#4B5B66] file:mr-3 file:rounded-lg file:border-0 file:bg-[#0A3D2E] file:px-3 file:py-2 file:text-xs file:font-medium file:text-white hover:file:bg-[#0A3D2E]/90"
          />
          {watermarkFile && (
            <p className="mt-1 text-xs text-emerald-700">
              Pending upload: {watermarkFile.name}
            </p>
          )}
          {config?.branding_configured && config.watermark_url && (
            <div className="mt-2 flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={config.watermark_url}
                alt="Saved report watermark"
                className="h-10 w-auto rounded border border-slate-200 bg-white p-1"
              />
              <button
                type="button"
                onClick={() => handleRemoveImage("watermark")}
                disabled={saving}
                className="inline-flex items-center gap-1 text-xs text-red-600 hover:underline disabled:opacity-50"
              >
                <Trash2 className="w-3.5 h-3.5" /> Remove watermark
              </button>
            </div>
          )}

          <div className="mt-3 grid grid-cols-2 gap-3">
            <div>
              <label className={labelCls} htmlFor="watermark-opacity">
                Opacity: {watermarkOpacity}%
              </label>
              <input
                id="watermark-opacity"
                type="range"
                min={0}
                max={100}
                step={5}
                value={watermarkOpacity}
                onChange={(e) => setWatermarkOpacity(Number(e.target.value))}
                className="w-full accent-[#0A3D2E]"
              />
            </div>
            <div>
              <label className={labelCls} htmlFor="watermark-position">Position</label>
              <select
                id="watermark-position"
                value={watermarkPosition}
                onChange={(e) => setWatermarkPosition(e.target.value)}
                className={selectCls}
              >
                <option value="center">Centre</option>
                <option value="top-left">Top left</option>
                <option value="top-right">Top right</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-5 flex items-center gap-3">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-lg bg-[#0A3D2E] px-4 py-2 text-sm font-medium text-white hover:bg-[#0A3D2E]/90 disabled:opacity-50"
        >
          <Upload className="w-4 h-4" />
          {saving ? "Saving…" : "Save branding"}
        </button>
        {config?.branding_configured && (
          <button
            type="button"
            onClick={handleRemoveAll}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" /> Remove all branding
          </button>
        )}
      </div>
    </section>
  );
}
