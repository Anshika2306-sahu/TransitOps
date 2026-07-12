import React, { useState, useEffect, useMemo, useCallback } from "react";
import axios from "axios";

const API_BASE = "http://localhost:5000/api";

const STATUS_STYLES = {
  Open: "bg-orange-50 text-orange-700 border border-orange-200",
  Closed: "bg-green-50 text-green-700 border border-green-200",
};

const STATUS_DOT = {
  Open: "bg-orange-500",
  Closed: "bg-green-500",
};

const PRIORITY_STYLES = {
  High: "bg-red-50 text-red-700 border border-red-200",
  Medium: "bg-orange-50 text-orange-700 border border-orange-200",
  Low: "bg-blue-50 text-blue-700 border border-blue-200",
};

function formatDate(value) {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return value;
  }
}

function todayLabel() {
  return new Date().toLocaleDateString(undefined, {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatCurrency(value) {
  const n = parseFloat(value);
  if (Number.isNaN(n)) return "$0.00";
  return "$" + n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

const Maintenance = () => {
  const [logs, setLogs] = useState([]);
  const [vehicles, setVehicles] = useState([]);

  const [loadingLogs, setLoadingLogs] = useState(true);
  const [loadingVehicles, setLoadingVehicles] = useState(true);
  const [fetchError, setFetchError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [vehicleFilter, setVehicleFilter] = useState("All");

  const [form, setForm] = useState({
    vehicle_id: "",
    description: "",
    cost: "",
    date: "",
    priority: "Medium",
    notes: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [formSuccess, setFormSuccess] = useState("");
  const [formError, setFormError] = useState("");

  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [tableError, setTableError] = useState("");

  const fetchData = useCallback(async () => {
    setLoadingLogs(true);
    setLoadingVehicles(true);
    try {
      const [lRes, vRes] = await Promise.all([
        axios.get(`${API_BASE}/maintenance`),
        axios.get(`${API_BASE}/vehicles`),
      ]);
      setLogs(Array.isArray(lRes.data) ? lRes.data : lRes.data?.logs || []);
      setVehicles(Array.isArray(vRes.data) ? vRes.data : vRes.data?.vehicles || []);
      setFetchError("");
    } catch (err) {
      console.error(err);
      setFetchError("Unable to load maintenance data. Please refresh the page.");
    } finally {
      setLoadingLogs(false);
      setLoadingVehicles(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const vehicleByReg = useMemo(() => {
    const map = {};
    vehicles.forEach((v) => {
      map[v.registration_number] = v;
    });
    return map;
  }, [vehicles]);

  const enrichedLogs = useMemo(() => {
    return logs.map((log) => {
      const vehicle = vehicleByReg[log.registration_number];
      return {
        ...log,
        name_model: log.name_model || vehicle?.name_model || "",
        vehicle_status: vehicle?.status || "",
      };
    });
  }, [logs, vehicleByReg]);

  const kpis = useMemo(() => {
    const total = logs.length;
    const open = logs.filter((l) => l.status === "Open").length;
    const closed = logs.filter((l) => l.status === "Closed").length;
    const inWorkshop = vehicles.filter((v) => v.status && v.status !== "Available").length;
    return { total, open, closed, inWorkshop };
  }, [logs, vehicles]);

  const stats = useMemo(() => {
    const total = logs.length || 1;
    const vehicleTotal = vehicles.length || 1;
    const openPct = Math.round((logs.filter((l) => l.status === "Open").length / total) * 100);
    const closedPct = Math.round((logs.filter((l) => l.status === "Closed").length / total) * 100);
    const inShopPct = Math.round(
      (vehicles.filter((v) => v.status && v.status !== "Available").length / vehicleTotal) * 100
    );
    return { openPct, closedPct, inShopPct };
  }, [logs, vehicles]);

  const costSummary = useMemo(() => {
    const costs = logs
      .map((l) => parseFloat(l.cost))
      .filter((n) => !Number.isNaN(n));
    if (costs.length === 0) {
      return { total: 0, average: 0, highest: 0, lowest: 0 };
    }
    const total = costs.reduce((sum, c) => sum + c, 0);
    return {
      total,
      average: total / costs.length,
      highest: Math.max(...costs),
      lowest: Math.min(...costs),
    };
  }, [logs]);

  const filteredLogs = useMemo(() => {
    let list = [...enrichedLogs];
    if (statusFilter !== "All") {
      list = list.filter((l) => l.status === statusFilter);
    }
    if (vehicleFilter !== "All") {
      list = list.filter((l) => l.registration_number === vehicleFilter);
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((l) => {
        return (
          (l.registration_number || "").toLowerCase().includes(q) ||
          (l.name_model || "").toLowerCase().includes(q) ||
          (l.description || "").toLowerCase().includes(q)
        );
      });
    }
    return list.sort((a, b) => (b.id || 0) - (a.id || 0));
  }, [enrichedLogs, statusFilter, vehicleFilter, search]);

  const recentActivity = useMemo(() => {
    return [...enrichedLogs].sort((a, b) => (b.id || 0) - (a.id || 0)).slice(0, 5);
  }, [enrichedLogs]);

  const handleFormChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setFormError("");
    setFormSuccess("");
  };

  const resetForm = () => {
    setForm({
      vehicle_id: "",
      description: "",
      cost: "",
      date: "",
      priority: "Medium",
      notes: "",
    });
  };

  const isFormValid =
    form.vehicle_id && form.description.trim() && form.cost && form.date;

  const handleLogService = async (e) => {
    e.preventDefault();
    setFormError("");
    setFormSuccess("");

    if (!isFormValid) {
      setFormError("Please fill in all required fields.");
      return;
    }

    setSubmitting(true);
    try {
      await axios.post(`${API_BASE}/maintenance`, form);
      setFormSuccess("Service log recorded successfully.");
      resetForm();
      fetchData();
    } catch (err) {
      console.error(err);
      setFormError(err.response?.data?.error || "Failed to log service");
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = async (id) => {
    setTableError("");
    setActionLoadingId(id);
    try {
      await axios.put(`${API_BASE}/maintenance/${id}/close`);
      fetchData();
    } catch (err) {
      console.error(err);
      setTableError("Failed to close log");
    } finally {
      setActionLoadingId(null);
    }
  };

  const isBoardLoading = loadingLogs || loadingVehicles;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Maintenance Dashboard</h1>
              <p className="text-sm text-gray-500 mt-1">
                Track service history and fleet workshop status
              </p>
              <p className="text-xs text-gray-400 mt-1">{todayLabel()}</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
              <div className="relative w-full sm:w-64">
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z"
                  />
                </svg>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search vehicle, model, description"
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full sm:w-36 py-2 px-3 text-sm rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
              >
                <option value="All">All Statuses</option>
                <option value="Open">Open</option>
                <option value="Closed">Closed</option>
              </select>

              <select
                value={vehicleFilter}
                onChange={(e) => setVehicleFilter(e.target.value)}
                className="w-full sm:w-44 py-2 px-3 text-sm rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
              >
                <option value="All">All Vehicles</option>
                {vehicles.map((v) => (
                  <option key={v.id} value={v.registration_number}>
                    {v.registration_number}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {fetchError && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 text-red-700 text-sm px-4 py-3">
            {fetchError}
          </div>
        )}

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <KpiCard
            label="Total Maintenance Logs"
            value={kpis.total}
            loading={loadingLogs}
            colorClasses="bg-purple-50 text-purple-600"
            icon={
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            }
          />
          <KpiCard
            label="Open Service Requests"
            value={kpis.open}
            loading={loadingLogs}
            colorClasses="bg-orange-50 text-orange-600"
            icon={
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            }
          />
          <KpiCard
            label="Completed Services"
            value={kpis.closed}
            loading={loadingLogs}
            colorClasses="bg-green-50 text-green-600"
            icon={
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            }
          />
          <KpiCard
            label="Vehicles In Workshop"
            value={kpis.inWorkshop}
            loading={loadingVehicles}
            colorClasses="bg-blue-50 text-blue-600"
            icon={
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 17h8m-8 0a2 2 0 11-4 0m4 0a2 2 0 104 0m4 0a2 2 0 104 0m-4 0a2 2 0 11-4 0m6-7l-2-5H7L5 10m14 0H5m14 0v6a1 1 0 01-1 1h-1m-11-7v6a1 1 0 001 1h1"
              />
            }
          />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* LEFT: Maintenance Form + panels */}
          <div className="xl:col-span-1 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-base font-semibold text-gray-900 mb-1">Log Service Record</h2>
              <p className="text-xs text-gray-500 mb-5">
                Record a new maintenance or service event
              </p>

              <form onSubmit={handleLogService} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Vehicle</label>
                  <select
                    required
                    value={form.vehicle_id}
                    onChange={handleFormChange("vehicle_id")}
                    className="w-full text-sm rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                  >
                    <option value="">
                      {loadingVehicles ? "Loading vehicles..." : "Select a vehicle..."}
                    </option>
                    {vehicles.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.registration_number} - {v.name_model} ({v.status})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Service Description
                  </label>
                  <textarea
                    required
                    value={form.description}
                    onChange={handleFormChange("description")}
                    placeholder="Oil change, brake inspection, etc."
                    className="w-full h-24 text-sm rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Service Cost
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      required
                      value={form.cost}
                      onChange={handleFormChange("cost")}
                      placeholder="0.00"
                      className="w-full text-sm rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Service Date
                    </label>
                    <input
                      type="date"
                      required
                      value={form.date}
                      onChange={handleFormChange("date")}
                      className="w-full text-sm rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Priority</label>
                  <select
                    value={form.priority}
                    onChange={handleFormChange("priority")}
                    className="w-full text-sm rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Notes (optional)
                  </label>
                  <textarea
                    value={form.notes}
                    onChange={handleFormChange("notes")}
                    placeholder="Additional notes for the workshop"
                    className="w-full h-16 text-sm rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition resize-none"
                  />
                </div>

                {formError && (
                  <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-700">
                    {formError}
                  </div>
                )}
                {formSuccess && (
                  <div className="rounded-lg bg-green-50 border border-green-200 px-3 py-2 text-xs text-green-700">
                    {formSuccess}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting || !isFormValid}
                  className="w-full flex items-center justify-center gap-2 rounded-lg bg-purple-600 text-white text-sm font-medium py-2.5 hover:bg-purple-700 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed transition"
                >
                  {submitting && (
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                      />
                    </svg>
                  )}
                  {submitting ? "Submitting..." : "Submit Service Log"}
                </button>
              </form>
            </div>

            {/* Maintenance Statistics */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-base font-semibold text-gray-900 mb-4">
                Maintenance Statistics
              </h2>
              <div className="space-y-4">
                <StatBar label="Open" percent={stats.openPct} barClass="bg-orange-500" />
                <StatBar label="Closed" percent={stats.closedPct} barClass="bg-green-500" />
                <StatBar
                  label="Vehicles In Shop"
                  percent={stats.inShopPct}
                  barClass="bg-blue-500"
                />
              </div>
            </div>

            {/* Service Cost Summary */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-base font-semibold text-gray-900 mb-4">
                Service Cost Summary
              </h2>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-gray-50 border border-gray-100 p-3">
                  <p className="text-[11px] text-gray-400 mb-1">Total Cost</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {formatCurrency(costSummary.total)}
                  </p>
                </div>
                <div className="rounded-lg bg-gray-50 border border-gray-100 p-3">
                  <p className="text-[11px] text-gray-400 mb-1">Average Cost</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {formatCurrency(costSummary.average)}
                  </p>
                </div>
                <div className="rounded-lg bg-gray-50 border border-gray-100 p-3">
                  <p className="text-[11px] text-gray-400 mb-1">Highest Cost</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {formatCurrency(costSummary.highest)}
                  </p>
                </div>
                <div className="rounded-lg bg-gray-50 border border-gray-100 p-3">
                  <p className="text-[11px] text-gray-400 mb-1">Lowest Cost</p>
                  <p className="text-sm font-semibold text-gray-900">
                    {formatCurrency(costSummary.lowest)}
                  </p>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-base font-semibold text-gray-900 mb-4">Recent Activity</h2>
              {recentActivity.length === 0 ? (
                <p className="text-xs text-gray-400">No maintenance logs yet.</p>
              ) : (
                <ul className="space-y-3">
                  {recentActivity.map((l) => (
                    <li key={l.id} className="flex items-center gap-3 text-xs">
                      <span
                        className={
                          "w-2 h-2 rounded-full flex-shrink-0 " +
                          (STATUS_DOT[l.status] || "bg-gray-400")
                        }
                      />
                      <span className="text-gray-700 flex-1 truncate">
                        {l.registration_number} — {l.description}
                      </span>
                      <span className="text-gray-400">{formatDate(l.date)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* RIGHT: Maintenance History */}
          <div className="xl:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-base font-semibold text-gray-900">Maintenance History</h2>
                <span className="text-xs text-gray-400">
                  {filteredLogs.length} record{filteredLogs.length === 1 ? "" : "s"}
                </span>
              </div>

              {tableError && (
                <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-700">
                  {tableError}
                </div>
              )}

              {isBoardLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <SkeletonRow key={i} />
                  ))}
                </div>
              ) : filteredLogs.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center py-16 border border-dashed border-gray-200 rounded-xl">
                  <svg
                    className="w-12 h-12 text-gray-300 mb-3"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9 3v2m6-2v2M5 7h14M5 7a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2M5 7l1-4h12l1 4"
                    />
                  </svg>
                  <p className="text-sm font-medium text-gray-500">
                    No Maintenance Records Found
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Submit a service log to see it appear here.
                  </p>
                </div>
              ) : (
                <>
                  {/* Table for md+ screens */}
                  <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead>
                        <tr className="border-b border-gray-100">
                          <th className="py-2 pr-4 font-medium text-gray-500 text-xs">Vehicle</th>
                          <th className="py-2 pr-4 font-medium text-gray-500 text-xs">Model</th>
                          <th className="py-2 pr-4 font-medium text-gray-500 text-xs">
                            Description
                          </th>
                          <th className="py-2 pr-4 font-medium text-gray-500 text-xs">Date</th>
                          <th className="py-2 pr-4 font-medium text-gray-500 text-xs">Cost</th>
                          <th className="py-2 pr-4 font-medium text-gray-500 text-xs">Priority</th>
                          <th className="py-2 pr-4 font-medium text-gray-500 text-xs">Status</th>
                          <th className="py-2 pr-4 font-medium text-gray-500 text-xs text-right">
                            Action
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredLogs.map((log) => (
                          <tr
                            key={log.id}
                            className="border-b border-gray-50 last:border-b-0 hover:bg-gray-50 transition"
                          >
                            <td className="py-3 pr-4 font-mono font-medium text-gray-800">
                              {log.registration_number}
                            </td>
                            <td className="py-3 pr-4 text-gray-600">
                              {log.name_model || "—"}
                            </td>
                            <td className="py-3 pr-4 text-gray-600 max-w-xs truncate">
                              {log.description}
                            </td>
                            <td className="py-3 pr-4 text-gray-600">{formatDate(log.date)}</td>
                            <td className="py-3 pr-4 text-gray-800 font-medium">
                              {formatCurrency(log.cost)}
                            </td>
                            <td className="py-3 pr-4">
                              {log.priority ? (
                                <span
                                  className={
                                    "text-[11px] font-medium px-2 py-0.5 rounded-full " +
                                    (PRIORITY_STYLES[log.priority] ||
                                      "bg-gray-50 text-gray-600 border border-gray-200")
                                  }
                                >
                                  {log.priority}
                                </span>
                              ) : (
                                <span className="text-gray-300 text-xs">—</span>
                              )}
                            </td>
                            <td className="py-3 pr-4">
                              <span
                                className={
                                  "text-[11px] font-medium px-2 py-0.5 rounded-full " +
                                  (STATUS_STYLES[log.status] ||
                                    "bg-gray-50 text-gray-600 border border-gray-200")
                                }
                              >
                                {log.status}
                              </span>
                            </td>
                            <td className="py-3 pr-4 text-right">
                              {log.status === "Open" ? (
                                <button
                                  onClick={() => handleClose(log.id)}
                                  disabled={actionLoadingId === log.id}
                                  className="text-xs font-medium rounded-lg px-3 py-1.5 bg-green-50 text-green-700 hover:bg-green-100 disabled:opacity-50 transition"
                                >
                                  {actionLoadingId === log.id ? "Working..." : "Close Log"}
                                </button>
                              ) : (
                                <span className="text-xs text-gray-400">Closed</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Cards for mobile screens with timeline */}
                  <div className="md:hidden space-y-4">
                    {filteredLogs.map((log) => (
                      <div
                        key={log.id}
                        className="rounded-xl border border-gray-100 p-4 hover:shadow-md transition"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">
                              {log.registration_number}{" "}
                              {log.name_model ? "· " + log.name_model : ""}
                            </p>
                            <p className="text-xs text-gray-500 truncate">{log.description}</p>
                          </div>
                          <span
                            className={
                              "text-[11px] font-medium px-2 py-0.5 rounded-full flex-shrink-0 " +
                              (STATUS_STYLES[log.status] ||
                                "bg-gray-50 text-gray-600 border border-gray-200")
                            }
                          >
                            {log.status}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                          <span>{formatDate(log.date)}</span>
                          <span className="font-medium text-gray-800">
                            {formatCurrency(log.cost)}
                          </span>
                          {log.priority && (
                            <span
                              className={
                                "text-[11px] font-medium px-2 py-0.5 rounded-full " +
                                (PRIORITY_STYLES[log.priority] ||
                                  "bg-gray-50 text-gray-600 border border-gray-200")
                              }
                            >
                              {log.priority}
                            </span>
                          )}
                        </div>

                        <MiniTimeline status={log.status} />

                        {log.status === "Open" && (
                          <button
                            onClick={() => handleClose(log.id)}
                            disabled={actionLoadingId === log.id}
                            className="mt-3 w-full text-xs font-medium rounded-lg py-1.5 bg-green-50 text-green-700 hover:bg-green-100 disabled:opacity-50 transition"
                          >
                            {actionLoadingId === log.id ? "Working..." : "Close Log"}
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

function KpiCard({ label, value, loading, colorClasses, icon }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-500 mb-1">{label}</p>
          {loading ? (
            <div className="h-7 w-12 bg-gray-100 rounded animate-pulse" />
          ) : (
            <p className="text-2xl font-semibold text-gray-900">{value}</p>
          )}
        </div>
        <div className={"w-10 h-10 rounded-xl flex items-center justify-center " + colorClasses}>
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            {icon}
          </svg>
        </div>
      </div>
    </div>
  );
}

function StatBar({ label, percent, barClass }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-gray-600">{label}</span>
        <span className="text-xs font-medium text-gray-700">{percent}%</span>
      </div>
      <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className={"h-full rounded-full " + barClass} style={{ width: percent + "%" }} />
      </div>
    </div>
  );
}

function MiniTimeline({ status }) {
  const stages = ["Vehicle", "Logged", "Open", "Closed"];
  const activeIndex = status === "Closed" ? 3 : 2;
  return (
    <div className="flex items-center">
      {stages.map((stage, i) => (
        <React.Fragment key={stage}>
          <div className="flex flex-col items-center">
            <div
              className={
                "w-2.5 h-2.5 rounded-full " +
                (i <= activeIndex ? "bg-purple-600" : "bg-gray-200")
              }
            />
            <span
              className={
                "text-[10px] mt-1 " +
                (i <= activeIndex ? "text-gray-600" : "text-gray-300")
              }
            >
              {stage}
            </span>
          </div>
          {i < stages.length - 1 && (
            <div
              className={
                "flex-1 h-0.5 mb-4 " + (i < activeIndex ? "bg-purple-600" : "bg-gray-200")
              }
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 p-3 rounded-lg border border-gray-100">
      <div className="h-4 w-20 bg-gray-100 rounded animate-pulse" />
      <div className="h-4 w-24 bg-gray-100 rounded animate-pulse" />
      <div className="h-4 flex-1 bg-gray-100 rounded animate-pulse" />
      <div className="h-4 w-16 bg-gray-100 rounded animate-pulse" />
      <div className="h-4 w-16 bg-gray-100 rounded-full animate-pulse" />
    </div>
  );
}

export default Maintenance;
