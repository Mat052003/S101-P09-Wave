"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";

type ExperienceType =
  | "RELAX"
  | "WELLNESS"
  | "GASTRONOMIC"
  | "ADVENTURE"
  | "ROMANTIC"
  | "CULTURAL";

type Hotel = {
  id: string;
  name: string;
  description: string;
  location: string;
  experienceType: ExperienceType;
  price: number;
  stars: number;
  services: string[];
  exclusiveFeatures: string[];
  images: string[];
};

const EXPERIENCE_LABELS: Record<ExperienceType, string> = {
  RELAX: "Relax",
  WELLNESS: "Wellness",
  GASTRONOMIC: "Gastronomic",
  ADVENTURE: "Adventure",
  ROMANTIC: "Romantic",
  CULTURAL: "Cultural",
};

const AVAILABLE_SERVICES = [
  "Spa",
  "Rooftop",
  "Pool",
  "Chef Table",
  "Airport Transfer",
  "Pet Friendly",
  "Yoga",
  "Winery",
];

export default function HotelSearchAndCompare() {
  const [location, setLocation] = useState("");
  const [experienceType, setExperienceType] = useState("");
  const [minPrice, setMinPrice] = useState("80");
  const [maxPrice, setMaxPrice] = useState("650");
  const [services, setServices] = useState<string[]>([]);

  const [hotels, setHotels] = useState<Hotel[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [comparisonHotels, setComparisonHotels] = useState<Hotel[]>([]);
  const [comparing, setComparing] = useState(false);
  const [compareError, setCompareError] = useState("");

  const selectedHotels = useMemo(
    () => hotels.filter((hotel) => selectedIds.includes(hotel.id)),
    [hotels, selectedIds]
  );

  async function fetchHotels(e?: FormEvent) {
    if (e) e.preventDefault();
    setLoading(true);
    setError("");

    const params = new URLSearchParams();
    if (location.trim()) params.set("location", location.trim());
    if (experienceType) params.set("experienceType", experienceType);
    params.set("minPrice", minPrice || "0");
    params.set("maxPrice", maxPrice || "999999");
    if (services.length > 0) params.set("services", services.join(","));

    const res = await fetch(`/api/hotels?${params.toString()}`);
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Could not load hotels");
      return;
    }

    setHotels(data.hotels || []);
    setSelectedIds((prev) => prev.filter((id) => (data.hotels || []).some((h: Hotel) => h.id === id)));
    setComparisonHotels([]);
  }

  useEffect(() => {
    fetchHotels();
  }, []);

  function toggleService(service: string) {
    setServices((current) =>
      current.includes(service)
        ? current.filter((item) => item !== service)
        : [...current, service]
    );
  }

  function toggleHotelForCompare(hotelId: string) {
    setCompareError("");
    setComparisonHotels([]);

    setSelectedIds((current) => {
      if (current.includes(hotelId)) return current.filter((id) => id !== hotelId);
      if (current.length >= 3) {
        setCompareError("You can compare up to 3 hotels.");
        return current;
      }
      return [...current, hotelId];
    });
  }

  async function runComparison() {
    setComparing(true);
    setCompareError("");

    const res = await fetch("/api/hotels/compare", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ hotelIds: selectedIds }),
    });

    const data = await res.json();
    setComparing(false);

    if (!res.ok) {
      setCompareError(data.error || "Could not compare hotels");
      return;
    }

    setComparisonHotels(data.hotels || []);
  }

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900">
      <div className="mx-auto w-full max-w-6xl px-4 py-8 md:px-8 md:py-12">
        <header className="mb-8 rounded-3xl border border-stone-200 bg-white p-6 shadow-sm md:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-600">S101-P09</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight md:text-5xl">Boutique Hotel Search and Compare</h1>
          <p className="mt-3 max-w-3xl text-sm text-stone-600 md:text-base">
            Advanced filters by location, experience type and price. Select up to three hotels to compare
            services and exclusive features side by side.
          </p>
        </header>

        <form onSubmit={fetchHotels} className="rounded-3xl border border-stone-200 bg-white p-6 shadow-sm md:p-8">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-stone-500">Location</label>
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Santiago, Valparaiso, Pucon"
                className="w-full rounded-xl border border-stone-200 px-3 py-2 text-sm outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-stone-500">Experience</label>
              <select
                value={experienceType}
                onChange={(e) => setExperienceType(e.target.value)}
                className="w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
              >
                <option value="">Any</option>
                {Object.entries(EXPERIENCE_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-stone-500">Min Price</label>
              <input
                type="number"
                min={0}
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="w-full rounded-xl border border-stone-200 px-3 py-2 text-sm outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-stone-500">Max Price</label>
              <input
                type="number"
                min={0}
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-full rounded-xl border border-stone-200 px-3 py-2 text-sm outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-100"
              />
            </div>
          </div>

          <div className="mt-5">
            <p className="mb-2 text-xs font-bold uppercase tracking-wider text-stone-500">Services</p>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_SERVICES.map((service) => {
                const active = services.includes(service);
                return (
                  <button
                    key={service}
                    type="button"
                    onClick={() => toggleService(service)}
                    className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                      active
                        ? "border-stone-900 bg-stone-900 text-white"
                        : "border-stone-300 bg-white text-stone-600 hover:border-stone-500"
                    }`}
                  >
                    {service}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={loading}
              className="rounded-xl bg-stone-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-amber-500 disabled:opacity-50"
            >
              {loading ? "Searching..." : "Apply Filters"}
            </button>
            <button
              type="button"
              onClick={() => {
                setLocation("");
                setExperienceType("");
                setMinPrice("0");
                setMaxPrice("999999");
                setServices([]);
                setSelectedIds([]);
                setComparisonHotels([]);
              }}
              className="rounded-xl border border-stone-300 px-5 py-2.5 text-sm font-semibold text-stone-700 transition hover:border-stone-500"
            >
              Clear
            </button>
          </div>

          {error && <p className="mt-4 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}
        </form>

        <section className="mt-8">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-extrabold">Results ({hotels.length})</h2>
            <button
              type="button"
              disabled={selectedIds.length < 2 || comparing}
              onClick={runComparison}
              className="rounded-xl bg-amber-500 px-4 py-2 text-sm font-bold text-stone-900 transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {comparing ? "Comparing..." : `Compare Selected (${selectedIds.length})`}
            </button>
          </div>

          {compareError && <p className="mb-4 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{compareError}</p>}

          {hotels.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-stone-300 bg-white p-10 text-center text-stone-500">
              No hotels found with the current filters.
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {hotels.map((hotel) => {
                const selected = selectedIds.includes(hotel.id);
                return (
                  <article
                    key={hotel.id}
                    className={`rounded-2xl border bg-white p-5 shadow-sm transition ${
                      selected ? "border-amber-500 ring-2 ring-amber-100" : "border-stone-200"
                    }`}
                  >
                    <div className="mb-3 flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-black">{hotel.name}</h3>
                        <p className="text-xs text-stone-500">{hotel.location}</p>
                      </div>
                      <label className="flex items-center gap-2 text-xs font-semibold text-stone-600">
                        <input
                          type="checkbox"
                          checked={selected}
                          onChange={() => toggleHotelForCompare(hotel.id)}
                        />
                        Compare
                      </label>
                    </div>

                    <p className="line-clamp-3 text-sm text-stone-600">{hotel.description}</p>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <span className="rounded-full bg-stone-900 px-2.5 py-1 text-xs font-bold text-white">
                        ${hotel.price.toFixed(0)} / night
                      </span>
                      <span className="rounded-full bg-stone-100 px-2.5 py-1 text-xs font-semibold text-stone-700">
                        {EXPERIENCE_LABELS[hotel.experienceType]}
                      </span>
                      <span className="rounded-full bg-stone-100 px-2.5 py-1 text-xs font-semibold text-stone-700">
                        {"★".repeat(hotel.stars)}
                      </span>
                    </div>

                    <div className="mt-4">
                      <p className="mb-1 text-[11px] font-bold uppercase tracking-wider text-stone-500">Services</p>
                      <div className="flex flex-wrap gap-1.5">
                        {hotel.services.length === 0 ? (
                          <span className="text-xs text-stone-400">No services loaded</span>
                        ) : (
                          hotel.services.map((service) => (
                            <span key={service} className="rounded-full border border-stone-200 px-2 py-0.5 text-xs text-stone-600">
                              {service}
                            </span>
                          ))
                        )}
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        {comparisonHotels.length > 0 && (
          <section className="mt-10 rounded-3xl border border-stone-200 bg-white p-6 shadow-sm md:p-8">
            <h2 className="text-xl font-extrabold">Comparison Table</h2>
            <div className="mt-5 overflow-x-auto">
              <table className="min-w-full border-collapse text-sm">
                <thead>
                  <tr>
                    <th className="border-b border-stone-200 px-3 py-2 text-left text-xs font-bold uppercase tracking-wider text-stone-500">Metric</th>
                    {comparisonHotels.map((hotel) => (
                      <th key={hotel.id} className="border-b border-stone-200 px-3 py-2 text-left text-xs font-bold uppercase tracking-wider text-stone-500">
                        {hotel.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border-b border-stone-100 px-3 py-3 font-semibold">Location</td>
                    {comparisonHotels.map((hotel) => (
                      <td key={hotel.id} className="border-b border-stone-100 px-3 py-3">{hotel.location}</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="border-b border-stone-100 px-3 py-3 font-semibold">Price / Night</td>
                    {comparisonHotels.map((hotel) => (
                      <td key={hotel.id} className="border-b border-stone-100 px-3 py-3">${hotel.price.toFixed(0)}</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="border-b border-stone-100 px-3 py-3 font-semibold">Experience</td>
                    {comparisonHotels.map((hotel) => (
                      <td key={hotel.id} className="border-b border-stone-100 px-3 py-3">{EXPERIENCE_LABELS[hotel.experienceType]}</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="border-b border-stone-100 px-3 py-3 font-semibold">Stars</td>
                    {comparisonHotels.map((hotel) => (
                      <td key={hotel.id} className="border-b border-stone-100 px-3 py-3">{"★".repeat(hotel.stars)}</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="border-b border-stone-100 px-3 py-3 font-semibold">Services</td>
                    {comparisonHotels.map((hotel) => (
                      <td key={hotel.id} className="border-b border-stone-100 px-3 py-3">{hotel.services.join(", ") || "-"}</td>
                    ))}
                  </tr>
                  <tr>
                    <td className="px-3 py-3 font-semibold">Exclusive Features</td>
                    {comparisonHotels.map((hotel) => (
                      <td key={hotel.id} className="px-3 py-3">{hotel.exclusiveFeatures.join(", ") || "-"}</td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        )}

        {selectedHotels.length > 0 && (
          <p className="mt-4 text-xs text-stone-500">
            Selected: {selectedHotels.map((hotel) => hotel.name).join(" | ")}
          </p>
        )}
      </div>
    </div>
  );
}
