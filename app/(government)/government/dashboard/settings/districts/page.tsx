"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  AlertTriangle, Building2, CheckCircle2, Loader2, MapPin, Pencil,
  Plus, RefreshCw, Search, Users, X,
} from "lucide-react";
import {
  District, DistrictInput, createDistrict, getDistricts, updateDistrict,
} from "@/services/settings";
import { useAuth } from "@/context/AuthContext";

/**
 * Operational Zones — the state's zonal jurisdiction (the `District` model).
 *
 * A zone is reference data, not a record: it scopes which projects an officer
 * can see and is the unit the HQ district heatmap aggregates by. That is why
 * the register is read here but shaped only by a Director or Agency Head.
 *
 * Zones are never deleted — `Profile.district` and `Project.district` are both
 * SET_NULL, so a delete would detach every project and officer scoped to the
 * zone without removing any of them. Retiring is the reversible equivalent,
 * and the server refuses to retire a zone that still holds projects.
 */

const BLANK_FORM = {
  name: "",
  code: "",
  state_region: "",
  lead_officer_name: "",
  lead_officer_email: "",
  office_address: "",
  description: "",
};

/** The server returns either the platform error envelope or a bare `detail`. */
function errorMessage(err: any, fallback: string): string {
  return (
    err?.response?.data?.detail ||
    err?.response?.data?.message ||
    err?.message ||
    fallback
  );
}

function notify(message: string, type: "success" | "error") {
  window.dispatchEvent(new CustomEvent("show-toast", { detail: { message, type } }));
}

export default function OperationalZonesPage() {
  const { user } = useAuth();

  // Server-side writes need Director or Agency Head. This is only about not
  // offering a button that is certain to be refused — the server remains the
  // authority, so an unrecorded role still shows the controls and lets it decide.
  const canManage = useMemo(() => {
    const role = (user?.role_name || "").toLowerCase().trim().replace(/[_-]+/g, " ");
    return !role || ["director", "agency head", "admin", "superadmin"].includes(role);
  }, [user?.role_name]);

  const [districts, setDistricts] = useState<District[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<"true" | "false" | "all">("true");

  const [editing, setEditing] = useState<District | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [form, setForm] = useState({ ...BLANK_FORM });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [retireTarget, setRetireTarget] = useState<District | null>(null);
  const [retireError, setRetireError] = useState<string | null>(null);
  const [isRetiring, setIsRetiring] = useState(false);

  const load = useCallback(async () => {
    setIsLoading(true);
    setLoadError(null);
    try {
      setDistricts(await getDistricts({ active: activeFilter }));
    } catch (err: any) {
      // An empty register and an unreadable one are different facts. Collapsing
      // a failure into [] would tell a Director that no zones exist while the
      // zones they created are still there.
      setDistricts([]);
      setLoadError(errorMessage(err, "The zone register could not be read from the server."));
    } finally {
      setIsLoading(false);
    }
  }, [activeFilter]);

  useEffect(() => {
    void load();
  }, [load]);

  const visible = useMemo(() => {
    const needle = search.trim().toLowerCase();
    if (!needle) return districts;
    return districts.filter((d) =>
      [d.name, d.code, d.state_region, d.lead_officer_name]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(needle)),
    );
  }, [districts, search]);

  // An empty register and an empty search result are different facts and must
  // not read as the same sentence.
  const emptyMessage = useMemo(() => {
    if (search.trim()) return "No zone matches that search.";
    if (activeFilter === "false") return "No zone has been retired.";
    return "No operational zone has been created yet.";
  }, [search, activeFilter]);

  const openCreate = () => {
    setEditing(null);
    setForm({ ...BLANK_FORM });
    setFormError(null);
    setIsDrawerOpen(true);
  };

  const openEdit = (district: District) => {
    setEditing(district);
    setForm({
      name: district.name || "",
      code: district.code || "",
      state_region: district.state_region || "",
      lead_officer_name: district.lead_officer_name || "",
      lead_officer_email: district.lead_officer_email || "",
      office_address: district.office_address || "",
      description: district.description || "",
    });
    setFormError(null);
    setIsDrawerOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.code.trim()) {
      setFormError("A zone needs both a name and a code.");
      return;
    }
    setIsSubmitting(true);
    setFormError(null);
    try {
      const payload: DistrictInput = {
        name: form.name.trim(),
        code: form.code.trim(),
        state_region: form.state_region.trim(),
        lead_officer_name: form.lead_officer_name.trim(),
        lead_officer_email: form.lead_officer_email.trim(),
        office_address: form.office_address.trim(),
        description: form.description.trim(),
      };
      if (editing) {
        await updateDistrict(editing.id, payload);
        notify(`${payload.name} updated.`, "success");
      } else {
        await createDistrict(payload);
        notify(`${payload.name} created.`, "success");
      }
      setIsDrawerOpen(false);
      await load();
    } catch (err: any) {
      // The server's reason is the useful one — a duplicate code, a missing
      // role. Showing "failed to save" instead would hide which.
      setFormError(errorMessage(err, "The zone could not be saved."));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRetire = async () => {
    if (!retireTarget) return;
    setIsRetiring(true);
    setRetireError(null);
    try {
      await updateDistrict(retireTarget.id, { is_active: false });
      notify(`${retireTarget.name} retired.`, "success");
      setRetireTarget(null);
      await load();
    } catch (err: any) {
      setRetireError(errorMessage(err, "The zone could not be retired."));
    } finally {
      setIsRetiring(false);
    }
  };

  const handleReactivate = async (district: District) => {
    try {
      await updateDistrict(district.id, { is_active: true });
      notify(`${district.name} is active again.`, "success");
      await load();
    } catch (err: any) {
      notify(errorMessage(err, "The zone could not be reactivated."), "error");
    }
  };

  return (
    <div className="w-full min-h-screen pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#022C4F] flex items-center gap-3">
            <MapPin className="text-purple-500" />
            Operational Zones
          </h1>
          <p className="text-gray-500 mt-1">
            The zonal jurisdictions of the state. Zones scope which projects an
            officer can see and are the unit the district risk heatmap
            aggregates by — they are recorded here, never invented.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => void load()}
            className="p-2.5 border border-gray-200 rounded-xl text-gray-500 hover:bg-gray-50 transition-colors cursor-pointer"
            title="Refresh"
          >
            <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
          </button>
          {canManage && (
            <button
              onClick={openCreate}
              className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-md shadow-blue-500/20 text-sm font-bold cursor-pointer"
            >
              <Plus size={16} />
              Add Zone
            </button>
          )}
        </div>
      </div>

      {!canManage && (
        <div className="mb-4 flex items-start gap-2 p-3 rounded-2xl border border-gray-200 bg-gray-50">
          <AlertTriangle size={15} className="text-gray-500 mt-0.5 shrink-0" />
          <p className="text-xs text-gray-600">
            You can read the zone register. Creating, amending and retiring a
            zone requires the Director or Agency Head role.
          </p>
        </div>
      )}

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search zones by name, code, region or lead officer..."
              className="pl-8 pr-3 py-2 w-full bg-white border border-gray-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <select
            value={activeFilter}
            onChange={(e) => setActiveFilter(e.target.value as "true" | "false" | "all")}
            className="px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
          >
            <option value="true">Active zones</option>
            <option value="false">Retired zones</option>
            <option value="all">All zones</option>
          </select>
        </div>

        {isLoading ? (
          <div className="p-12 flex items-center justify-center gap-2 text-sm text-gray-500">
            <Loader2 size={16} className="animate-spin" />
            Loading the zone register...
          </div>
        ) : loadError ? (
          <div className="p-8">
            <div className="flex items-start gap-3 p-4 rounded-2xl border border-red-200 bg-red-50">
              <AlertTriangle size={18} className="text-red-600 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-bold text-red-800">
                  The zone register could not be read
                </p>
                <p className="text-xs text-red-700 mt-1">{loadError}</p>
                <button
                  onClick={() => void load()}
                  className="mt-3 px-3 py-1.5 bg-white border border-red-200 rounded-lg text-xs font-bold text-red-700 hover:bg-red-100 transition-colors cursor-pointer"
                >
                  Retry
                </button>
              </div>
            </div>
          </div>
        ) : visible.length === 0 ? (
          <div className="p-12 text-center">
            <MapPin size={28} className="mx-auto text-gray-300" />
            <p className="mt-3 text-sm font-semibold text-gray-700">
              {emptyMessage}
            </p>
            {districts.length === 0 && !search && activeFilter === "true" && (
              <p className="mt-1 text-xs text-gray-500">
                Create the first zone to make it selectable when reassigning an
                inspector or registering a stakeholder.
              </p>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50/40">
                  <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-wider text-gray-400">Zone</th>
                  <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-wider text-gray-400">Region</th>
                  <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-wider text-gray-400">Lead officer</th>
                  <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-wider text-gray-400">In use</th>
                  <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-wider text-gray-400">Status</th>
                  <th className="px-6 py-3 text-[10px] font-bold uppercase tracking-wider text-gray-400 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {visible.map((district) => (
                  <motion.tr
                    key={district.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-gray-50/60 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <span className="text-sm font-bold text-gray-900 block">{district.name}</span>
                      <span className="text-[11px] font-mono text-gray-400">{district.code}</span>
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-600">
                      {district.state_region || <span className="text-gray-400">Not recorded</span>}
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-600">
                      {district.lead_officer_name || <span className="text-gray-400">Not recorded</span>}
                      {district.lead_officer_email && (
                        <span className="block text-[11px] text-gray-400">{district.lead_officer_email}</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3 text-[11px] font-semibold text-gray-600">
                        <span className="flex items-center gap-1" title="Projects assigned to this zone">
                          <Building2 size={12} className="text-gray-400" />
                          {district.project_count}
                        </span>
                        <span className="flex items-center gap-1" title="Officers scoped to this zone">
                          <Users size={12} className="text-gray-400" />
                          {district.staff_count}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {district.is_active ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md border border-emerald-200 bg-emerald-50 text-emerald-700 text-[10px] font-semibold">
                          <CheckCircle2 size={10} /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md border border-gray-300 bg-gray-100 text-gray-600 text-[10px] font-semibold">
                          Retired
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        {!canManage ? (
                          <span className="text-[11px] text-gray-400">Read only</span>
                        ) : (
                          <>
                            <button
                              onClick={() => openEdit(district)}
                              className="p-2 rounded-lg border border-gray-200 text-gray-500 hover:bg-gray-50 transition-colors cursor-pointer"
                              title="Edit this zone"
                            >
                              <Pencil size={13} />
                            </button>
                            {district.is_active ? (
                              <button
                                onClick={() => {
                                  setRetireTarget(district);
                                  setRetireError(null);
                                }}
                                className="px-3 py-1.5 rounded-lg border border-gray-200 text-[11px] font-bold text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
                              >
                                Retire
                              </button>
                            ) : (
                              <button
                                onClick={() => void handleReactivate(district)}
                                className="px-3 py-1.5 rounded-lg border border-gray-200 text-[11px] font-bold text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
                              >
                                Reactivate
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <p className="mt-4 text-[11px] text-gray-400">
        Zones are retired, never deleted — a project or an officer scoped to a
        deleted zone would keep the reference while the zone itself vanished.
      </p>

      {/* ------------------------------------------------------ create / edit */}
      {isDrawerOpen && (
        <>
          <div
            className="fixed inset-0 bg-[#0F181F]/40 backdrop-blur-sm z-[100]"
            onClick={() => setIsDrawerOpen(false)}
          />
          <div className="fixed right-4 top-4 bottom-4 w-full max-w-[560px] bg-white rounded-[32px] p-8 md:p-10 shadow-2xl flex flex-col z-[101] overflow-y-auto">
            <button
              onClick={() => setIsDrawerOpen(false)}
              className="absolute top-8 right-8 w-10 h-10 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
            >
              <X size={18} />
            </button>

            <h2 className="text-xl font-bold text-[#022C4F]">
              {editing ? "Edit operational zone" : "Add an operational zone"}
            </h2>
            <p className="text-xs text-gray-500 mt-1 mb-6">
              {editing
                ? "Changing a zone changes how it is listed and which projects it appears against."
                : "Record a real jurisdiction of the state. Officers and projects are assigned to it afterwards."}
            </p>

            <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
              <div className="space-y-4">
                <div>
                  <label htmlFor="zone-name" className="block text-xs font-bold text-gray-700 mb-1.5">
                    Zone name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="zone-name"
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="e.g. Eti-Osa"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="zone-code" className="block text-xs font-bold text-gray-700 mb-1.5">
                    Zone code <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="zone-code"
                    type="text"
                    value={form.code}
                    onChange={(e) => setForm({ ...form, code: e.target.value })}
                    placeholder="e.g. Z-ETI"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <p className="mt-1 text-[11px] text-gray-400">
                    Must be unique — it is the short reference used on registers and reports.
                  </p>
                </div>

                <div>
                  <label htmlFor="zone-region" className="block text-xs font-bold text-gray-700 mb-1.5">
                    State / region
                  </label>
                  <input
                    id="zone-region"
                    type="text"
                    value={form.state_region}
                    onChange={(e) => setForm({ ...form, state_region: e.target.value })}
                    placeholder="e.g. Lagos"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="zone-lead-name" className="block text-xs font-bold text-gray-700 mb-1.5">
                      Lead officer
                    </label>
                    <input
                      id="zone-lead-name"
                      type="text"
                      value={form.lead_officer_name}
                      onChange={(e) => setForm({ ...form, lead_officer_name: e.target.value })}
                      placeholder="e.g. Engr. A. Onike"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label htmlFor="zone-lead-email" className="block text-xs font-bold text-gray-700 mb-1.5">
                      Lead officer email
                    </label>
                    <input
                      id="zone-lead-email"
                      type="email"
                      value={form.lead_officer_email}
                      onChange={(e) => setForm({ ...form, lead_officer_email: e.target.value })}
                      placeholder="e.g. a.onike@example.gov.ng"
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="zone-office" className="block text-xs font-bold text-gray-700 mb-1.5">
                    District office address
                  </label>
                  <input
                    id="zone-office"
                    type="text"
                    value={form.office_address}
                    onChange={(e) => setForm({ ...form, office_address: e.target.value })}
                    placeholder="Where the zone's office sits"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="zone-description" className="block text-xs font-bold text-gray-700 mb-1.5">
                    Description
                  </label>
                  <textarea
                    id="zone-description"
                    rows={3}
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="What this zone covers"
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>
              </div>

              {formError && (
                <div className="mt-4 flex items-start gap-2 p-3 rounded-xl border border-red-200 bg-red-50">
                  <AlertTriangle size={15} className="text-red-600 mt-0.5 shrink-0" />
                  <p className="text-xs text-red-700">{formError}</p>
                </div>
              )}

              <div className="mt-auto pt-6 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsDrawerOpen(false)}
                  className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting && <Loader2 size={14} className="animate-spin" />}
                  {editing ? "Save changes" : "Create zone"}
                </button>
              </div>
            </form>
          </div>
        </>
      )}

      {/* ------------------------------------------------------------ retire */}
      {retireTarget && (
        <>
          <div
            className="fixed inset-0 bg-[#0F181F]/40 backdrop-blur-sm z-[100]"
            onClick={() => setRetireTarget(null)}
          />
          <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[92vw] max-w-md bg-white rounded-3xl p-7 shadow-2xl z-[101]">
            <h3 className="text-lg font-bold text-[#022C4F]">
              Retire {retireTarget.name}?
            </h3>
            <p className="text-xs text-gray-500 mt-2">
              It leaves the active register and stops appearing in the zone
              dropdowns. Nothing is deleted, and you can make it active again at
              any time.
            </p>
            {retireTarget.project_count > 0 && (
              <div className="mt-4 flex items-start gap-2 p-3 rounded-xl border border-amber-200 bg-amber-50">
                <AlertTriangle size={15} className="text-amber-600 mt-0.5 shrink-0" />
                <p className="text-xs text-amber-800">
                  {retireTarget.project_count} project
                  {retireTarget.project_count === 1 ? " is" : "s are"} still
                  assigned to this zone. The server will refuse the retirement
                  until they are moved.
                </p>
              </div>
            )}
            {retireError && (
              <div className="mt-4 flex items-start gap-2 p-3 rounded-xl border border-red-200 bg-red-50">
                <AlertTriangle size={15} className="text-red-600 mt-0.5 shrink-0" />
                <p className="text-xs text-red-700">{retireError}</p>
              </div>
            )}
            <div className="mt-6 flex items-center gap-3">
              <button
                onClick={() => setRetireTarget(null)}
                className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => void handleRetire()}
                disabled={isRetiring}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-gray-800 text-white rounded-xl text-sm font-bold hover:bg-gray-900 transition-colors disabled:opacity-50 cursor-pointer"
              >
                {isRetiring && <Loader2 size={14} className="animate-spin" />}
                Retire zone
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
