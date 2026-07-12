import React, { useState, useEffect, useMemo, useCallback } from "react";
import axios from "axios";

const API_BASE = "http://localhost:5000/api";

const STATUS_STYLES = {
  Dispatched: "bg-blue-50 text-blue-700 border border-blue-200",
  Completed: "bg-green-50 text-green-700 border border-green-200",
  Cancelled: "bg-red-50 text-red-700 border border-red-200",
  Draft: "bg-yellow-50 text-yellow-700 border border-yellow-200",
};

const STATUS_DOT = {
  Dispatched: "bg-blue-500",
  Completed: "bg-green-500",
  Cancelled: "bg-red-500",
  Draft: "bg-yellow-500",
};

function formatDateTime(value) {
  if (!value) return "—";
  try {
    return new Date(value).toLocaleString(undefined, {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
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

export default function Trips() {
  const [trips, setTrips] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [drivers, setDrivers] = useState([]);

  const [loadingTrips, setLoadingTrips] = useState(true);
  const [loadingVehicles, setLoadingVehicles] = useState(true);
  const [loadingDrivers, setLoadingDrivers] = useState(true);

  const [fetchError, setFetchError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  const [form, setForm] = useState({
    source: "",
    destination: "",
    vehicle_id: "",
    driver_id: "",
    cargo_weight: "",
    planned_distance: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [dispatchSuccess, setDispatchSuccess] = useState("");
  const [dispatchError, setDispatchError] = useState("");

  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [boardError, setBoardError] = useState("");

  const fetchTrips = useCallback(async () => {
    setLoadingTrips(true);
    try {
      const res = await axios.get(`${API_BASE}/trips`);
      setTrips(Array.isArray(res.data) ? res.data : res.data?.trips || []);
      setFetchError("");
    } catch (err) {
      console.error(err);
      setFetchError("Unable to load trips. Please refresh the page.");
    } finally {
      setLoadingTrips(false);
    }
  }, []);

  const fetchVehicles = useCallback(async () => {
    setLoadingVehicles(true);
    try {
      const res = await axios.get(`${API_BASE}/vehicles`);
      setVehicles(Array.isArray(res.data) ? res.data : res.data?.vehicles || []);
    } catch (err) {
      console.error(err);
      setFetchError("Unable to load vehicles. Please refresh the page.");
    } finally {
      setLoadingVehicles(false);
    }
  }, []);

  const fetchDrivers = useCallback(async () => {
    setLoadingDrivers(true);
    try {
      const res = await axios.get(`${API_BASE}/drivers`);
      setDrivers(Array.isArray(res.data) ? res.data : res.data?.drivers || []);
    } catch (err) {
      console.error(err);
      setFetchError("Unable to load drivers. Please refresh the page.");
    } finally {
      setLoadingDrivers(false);
    }
  }, []);

  const refreshAll = useCallback(() => {
    fetchTrips();
    fetchVehicles();
    fetchDrivers();
  }, [fetchTrips, fetchVehicles, fetchDrivers]);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  const availableVehicles = useMemo(
    () => vehicles.filter((v) => v.status === "Available"),
    [vehicles]
  );

  // Drivers may or may not carry a status field depending on the backend
  // implementation — only filter on it if it's actually present.
  const availableDrivers = useMemo(
    () => drivers.filter((d) => d.status === undefined || d.status === "Available"),
    [drivers]
  );

  const selectedVehicle = useMemo(
    () => vehicles.find((v) => String(v.id) === String(form.vehicle_id)),
    [vehicles, form.vehicle_id]
  );

  const capacityExceeded = useMemo(() => {
    if (!selectedVehicle || !form.cargo_weight) return false;
    return parseFloat(form.cargo_weight) > parseFloat(selectedVehicle.max_load_capacity);
  }, [selectedVehicle, form.cargo_weight]);

  const kpis = useMemo(() => {
    const active = trips.filter((t) => t.status === "Dispatched").length;
    const completed = trips.filter((t) => t.status === "Completed").length;
    const cancelled = trips.filter((t) => t.status === "Cancelled").length;
    return {
      active,
      completed,
      cancelled,
      availableVehicles: availableVehicles.length,
    };
  }, [trips, availableVehicles]);

  const stats = useMemo(() => {
    const total = trips.length || 1;
    const completedPct = Math.round(
      (trips.filter((t) => t.status === "Completed").length / total) * 100
    );
    const cancelledPct = Math.round(
      (trips.filter((t) => t.status === "Cancelled").length / total) * 100
    );
    const dispatchedPct = Math.round(
      (trips.filter((t) => t.status === "Dispatched").length / total) * 100
    );
    return { completedPct, cancelledPct, dispatchedPct };
  }, [trips]);

  const filteredTrips = useMemo(() => {
    let list = [...trips];
    if (statusFilter !== "All") {
      list = list.filter((t) => t.status === statusFilter);
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter((t) => {
        const vehicleNo = t.registration_number || "";
        const driverName = t.driver_name || "";
        return (
          (t.source || "").toLowerCase().includes(q) ||
          (t.destination || "").toLowerCase().includes(q) ||
          vehicleNo.toLowerCase().includes(q) ||
          driverName.toLowerCase().includes(q)
        );
      });
    }
    return list.sort((a, b) => (b.id || 0) - (a.id || 0));
  }, [trips, statusFilter, search]);

  const recentActivity = useMemo(() => {
    return [...trips]
      .filter((t) => t.status === "Dispatched")
      .sort((a, b) => (b.id || 0) - (a.id || 0))
      .slice(0, 5);
  }, [trips]);

  const handleFormChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    setDispatchError("");
    setDispatchSuccess("");
  };

  const resetForm = () => {
    setForm({
      source: "",
      destination: "",
      vehicle_id: "",
      driver_id: "",
      cargo_weight: "",
      planned_distance: "",
    });
  };

  const isFormValid =
    form.source.trim() &&
    form.destination.trim() &&
    form.vehicle_id &&
    form.driver_id &&
    form.cargo_weight &&
    form.planned_distance &&
    !capacityExceeded;

  const handleDispatch = async (e) => {
    e.preventDefault();
    setDispatchSuccess("");
    setDispatchError("");

    const vehicle = vehicles.find((v) => v.id === parseInt(form.vehicle_id));
    if (vehicle && parseFloat(form.cargo_weight) > vehicle.max_load_capacity) {
      setDispatchError(`Capacity exceeded! Max allowed: ${vehicle.max_load_capacity} kg`);
      return;
    }
    if (!isFormValid) {
      setDispatchError("Please fill in all required fields.");
      return;
    }

    setSubmitting(true);
    try {
      await axios.post(`${API_BASE}/trips/dispatch`, form);
      setDispatchSuccess("Trip dispatched successfully.");
      resetForm();
      refreshAll();
    } catch (err) {
      setDispatchError(err.response?.data?.error || "Dispatch failed");
    } finally {
      setSubmitting(false);
    }
  };

  const handleComplete = async (id) => {
    setBoardError("");
    setActionLoadingId(id);
    try {
      await axios.post(`${API_BASE}/trips/${id}/complete`);
      refreshAll();
    } catch (err) {
      console.error(err);
      setBoardError("Failed to complete trip. Please try again.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleCancel = async (id) => {
    setBoardError("");
    setActionLoadingId(id);
    try {
      await axios.post(`${API_BASE}/trips/${id}/cancel`);
      refreshAll();
    } catch (err) {
      console.error(err);
      setBoardError("Failed to cancel trip. Please try again.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const isBoardLoading = loadingTrips || loadingVehicles || loadingDrivers;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">
                Trip Dispatcher
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Monitor and dispatch fleet trips in real time
              </p>
              <p className="text-xs text-gray-400 mt-1">{todayLabel()}</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">
              <div className="relative w-full sm:w-72">
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
                  placeholder="Search source, destination, vehicle, driver"
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                />
              </div>

              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full sm:w-44 py-2 px-3 text-sm rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
              >
                <option value="All">All Statuses</option>
                <option value="Dispatched">Dispatched</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
                <option value="Draft">Draft</option>
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
            label="Active Trips"
            value={kpis.active}
            loading={loadingTrips}
            colorClasses="bg-blue-50 text-blue-600"
            icon={
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            }
          />
          <KpiCard
            label="Completed Trips"
            value={kpis.completed}
            loading={loadingTrips}
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
            label="Cancelled Trips"
            value={kpis.cancelled}
            loading={loadingTrips}
            colorClasses="bg-red-50 text-red-600"
            icon={
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            }
          />
          <KpiCard
            label="Available Vehicles"
            value={kpis.availableVehicles}
            loading={loadingVehicles}
            colorClasses="bg-purple-50 text-purple-600"
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
          {/* LEFT: Dispatch Form */}
          <div className="xl:col-span-1 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-base font-semibold text-gray-900 mb-1">
                Dispatch a Trip
              </h2>
              <p className="text-xs text-gray-500 mb-5">
                Assign a vehicle and driver to a new trip
              </p>

              <form onSubmit={handleDispatch} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Source
                    </label>
                    <input
                      type="text"
                      required
                      value={form.source}
                      onChange={handleFormChange("source")}
                      placeholder="Warehouse A"
                      className="w-full text-sm rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Destination
                    </label>
                    <input
                      type="text"
                      required
                      value={form.destination}
                      onChange={handleFormChange("destination")}
                      placeholder="Distribution Hub B"
                      className="w-full text-sm rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Vehicle (Available Only)
                  </label>
                  <select
                    required
                    value={form.vehicle_id}
                    onChange={handleFormChange("vehicle_id")}
                    className="w-full text-sm rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                  >
                    <option value="">
                      {loadingVehicles ? "Loading vehicles..." : "Select a vehicle..."}
                    </option>
                    {availableVehicles.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.registration_number} - {v.name_model} (Max: {v.max_load_capacity}kg)
                      </option>
                    ))}
                  </select>
                  {!loadingVehicles && availableVehicles.length === 0 && (
                    <p className="text-xs text-gray-400 mt-1">
                      No vehicles currently available.
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">
                    Driver
                  </label>
                  <select
                    required
                    value={form.driver_id}
                    onChange={handleFormChange("driver_id")}
                    className="w-full text-sm rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                  >
                    <option value="">
                      {loadingDrivers ? "Loading drivers..." : "Select a driver..."}
                    </option>
                    {availableDrivers.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.name}
                      </option>
                    ))}
                  </select>
                  {!loadingDrivers && availableDrivers.length === 0 && (
                    <p className="text-xs text-gray-400 mt-1">
                      No drivers currently available.
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Cargo Weight (kg)
                    </label>
                    <input
                      type="number"
                      min="0"
                      required
                      value={form.cargo_weight}
                      onChange={handleFormChange("cargo_weight")}
                      placeholder="0"
                      className="w-full text-sm rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">
                      Distance (km)
                    </label>
                    <input
                      type="number"
                      min="0"
                      required
                      value={form.planned_distance}
                      onChange={handleFormChange("planned_distance")}
                      placeholder="0"
                      className="w-full text-sm rounded-lg border border-gray-200 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                    />
                  </div>
                </div>

                {selectedVehicle && (
                  <div
                    className={
                      "rounded-lg px-3 py-2 text-xs font-medium " +
                      (capacityExceeded
                        ? "bg-red-50 text-red-700 border border-red-200"
                        : "bg-gray-50 text-gray-600 border border-gray-200")
                    }
                  >
                    Vehicle capacity: {selectedVehicle.max_load_capacity} kg
                    {form.cargo_weight
                      ? " · Cargo entered: " + form.cargo_weight + " kg"
                      : ""}
                  </div>
                )}

                {capacityExceeded && (
                  <div className="flex items-start gap-2 rounded-lg bg-red-50 border border-red-200 px-3 py-2">
                    <svg
                      className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </svg>
                    <p className="text-xs text-red-700">
                      Cargo weight exceeds this vehicle's maximum capacity.
                      Choose a different vehicle or reduce cargo weight.
                    </p>
                  </div>
                )}

                {dispatchError && (
                  <div className="rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-700">
                    {dispatchError}
                  </div>
                )}
                {dispatchSuccess && (
                  <div className="rounded-lg bg-green-50 border border-green-200 px-3 py-2 text-xs text-green-700">
                    {dispatchSuccess}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting || !isFormValid}
                  className="w-full flex items-center justify-center gap-2 rounded-lg bg-purple-600 text-white text-sm font-medium py-2.5 hover:bg-purple-700 disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed transition"
                >
                  {submitting && (
                    <svg
                      className="animate-spin h-4 w-4"
                      viewBox="0 0 24 24"
                      fill="none"
                    >
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
                  {submitting ? "Dispatching..." : "Dispatch Trip"}
                </button>
              </form>
            </div>

            {/* Trip Statistics */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-base font-semibold text-gray-900 mb-4">
                Trip Statistics
              </h2>
              <div className="space-y-4">
                <StatBar
                  label="Completed"
                  percent={stats.completedPct}
                  barClass="bg-green-500"
                />
                <StatBar
                  label="Dispatched"
                  percent={stats.dispatchedPct}
                  barClass="bg-blue-500"
                />
                <StatBar
                  label="Cancelled"
                  percent={stats.cancelledPct}
                  barClass="bg-red-500"
                />
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-base font-semibold text-gray-900 mb-4">
                Recent Activity
              </h2>
              {recentActivity.length === 0 ? (
                <p className="text-xs text-gray-400">
                  No recent dispatches yet.
                </p>
              ) : (
                <ul className="space-y-3">
                  {recentActivity.map((t) => (
                    <li key={t.id} className="flex items-center gap-3 text-xs">
                      <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
                      <span className="text-gray-700 flex-1 truncate">
                        {t.source} → {t.destination}
                      </span>
                      <span className="text-gray-400">
                        {t.registration_number || ""}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* RIGHT: Live Trip Board */}
          <div className="xl:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-base font-semibold text-gray-900">
                  Live Trip Board
                </h2>
                <span className="text-xs text-gray-400">
                  {filteredTrips.length} trip{filteredTrips.length === 1 ? "" : "s"}
                </span>
              </div>

              {boardError && (
                <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-xs text-red-700">
                  {boardError}
                </div>
              )}

              {isBoardLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <SkeletonCard key={i} />
                  ))}
                </div>
              ) : filteredTrips.length === 0 ? (
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
                      d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"
                    />
                  </svg>
                  <p className="text-sm font-medium text-gray-500">No Trips Found</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Dispatch a trip to see it appear here.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {filteredTrips.map((trip) => (
                    <div
                      key={trip.id}
                      className="rounded-xl border border-gray-100 p-4 hover:shadow-md hover:border-gray-200 transition"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2 min-w-0">
                          <span
                            className={
                              "w-2 h-2 rounded-full flex-shrink-0 " +
                              (STATUS_DOT[trip.status] || "bg-gray-400")
                            }
                          />
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {trip.source} → {trip.destination}
                          </p>
                        </div>
                        <span
                          className={
                            "text-[11px] font-medium px-2 py-0.5 rounded-full flex-shrink-0 " +
                            (STATUS_STYLES[trip.status] ||
                              "bg-gray-50 text-gray-600 border border-gray-200")
                          }
                        >
                          {trip.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-y-2 gap-x-3 text-xs text-gray-500 mb-3">
                        <div>
                          <span className="text-gray-400">Vehicle</span>
                          <p className="text-gray-700 font-medium truncate">
                            {trip.registration_number || "—"}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-400">Driver</span>
                          <p className="text-gray-700 font-medium truncate">
                            {trip.driver_name || "Admin Manager"}
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-400">Cargo</span>
                          <p className="text-gray-700 font-medium">
                            {trip.cargo_weight ?? "—"} kg
                          </p>
                        </div>
                        <div>
                          <span className="text-gray-400">Distance</span>
                          <p className="text-gray-700 font-medium">
                            {trip.planned_distance ?? "—"} km
                          </p>
                        </div>
                        {trip.start_time && (
                          <div className="col-span-2">
                            <span className="text-gray-400">Start Time</span>
                            <p className="text-gray-700 font-medium">
                              {formatDateTime(trip.start_time)}
                            </p>
                          </div>
                        )}
                      </div>

                      {trip.status === "Dispatched" && (
                        <div className="flex gap-2 pt-2 border-t border-gray-100">
                          <button
                            onClick={() => handleComplete(trip.id)}
                            disabled={actionLoadingId === trip.id}
                            className="flex-1 text-xs font-medium rounded-lg py-1.5 bg-green-50 text-green-700 hover:bg-green-100 disabled:opacity-50 transition"
                          >
                            {actionLoadingId === trip.id ? "Working..." : "Complete"}
                          </button>
                          <button
                            onClick={() => handleCancel(trip.id)}
                            disabled={actionLoadingId === trip.id}
                            className="flex-1 text-xs font-medium rounded-lg py-1.5 bg-red-50 text-red-700 hover:bg-red-100 disabled:opacity-50 transition"
                          >
                            {actionLoadingId === trip.id ? "Working..." : "Cancel"}
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

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
        <div
          className={"h-full rounded-full " + barClass}
          style={{ width: percent + "%" }}
        />
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="rounded-xl border border-gray-100 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="h-4 w-32 bg-gray-100 rounded animate-pulse" />
        <div className="h-4 w-16 bg-gray-100 rounded-full animate-pulse" />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="h-3 w-full bg-gray-100 rounded animate-pulse" />
        <div className="h-3 w-full bg-gray-100 rounded animate-pulse" />
        <div className="h-3 w-full bg-gray-100 rounded animate-pulse" />
        <div className="h-3 w-full bg-gray-100 rounded animate-pulse" />
      </div>
    </div>
  );
}
