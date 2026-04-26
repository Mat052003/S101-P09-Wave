"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

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
};

const EXPERIENCE_LABELS: Record<ExperienceType, string> = {
  RELAX: "Relax",
  WELLNESS: "Wellness",
  GASTRONOMIC: "Gastronomic",
  ADVENTURE: "Adventure",
  ROMANTIC: "Romantic",
  CULTURAL: "Cultural",
};

const SERVICES = ["Spa", "Rooftop", "Pool", "Chef Table", "Airport Transfer", "Pet Friendly", "Yoga", "Winery"];

const COMPARISON_COLUMN_STYLES = [
  { header: "bg-[#284B63]/14 text-[#153243] border-[#153243]/20", cell: "bg-[#EEF0EB]" },
  { header: "bg-[#B4B8AB]/24 text-[#153243] border-[#153243]/16", cell: "bg-[#F4F9E9]" },
  { header: "bg-[#153243]/12 text-[#153243] border-[#153243]/22", cell: "bg-[#EEF0EB]" },
];

export default function HotelsPage() {
  const [location, setLocation] = useState("");
  const [experienceType, setExperienceType] = useState("");
  const [minPrice, setMinPrice] = useState("80");
  const [maxPrice, setMaxPrice] = useState("650");
  const [services, setServices] = useState<string[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [filteredHotels, setFilteredHotels] = useState<Hotel[]>([]);
  const [comparisonHotels, setComparisonHotels] = useState<Hotel[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [comparing, setComparing] = useState(false);

  const selectedHotels = useMemo(
    () => filteredHotels.filter((hotel) => selectedIds.includes(hotel.id)),
    [filteredHotels, selectedIds]
  );

  const maxComparisonPrice = useMemo(() => {
    if (comparisonHotels.length === 0) return null;
    return Math.max(...comparisonHotels.map((hotel) => hotel.price));
  }, [comparisonHotels]);

  const maxComparisonStars = useMemo(() => {
    if (comparisonHotels.length === 0) return null;
    return Math.max(...comparisonHotels.map((hotel) => hotel.stars));
  }, [comparisonHotels]);

  async function fetchHotels(options?: {
    location?: string;
    experienceType?: string;
    minPrice?: string;
    maxPrice?: string;
    services?: string[];
  }) {
    setLoading(true);
    setError("");

    const activeLocation = options?.location ?? location;
    const activeExperienceType = options?.experienceType ?? experienceType;
    const activeMinPrice = options?.minPrice ?? minPrice;
    const activeMaxPrice = options?.maxPrice ?? maxPrice;
    const activeServices = options?.services ?? services;

    const params = new URLSearchParams();
    if (activeLocation.trim()) params.set("location", activeLocation.trim());
    if (activeExperienceType) params.set("experienceType", activeExperienceType);
    params.set("minPrice", activeMinPrice || "0");
    params.set("maxPrice", activeMaxPrice || "999999");
    if (activeServices.length > 0) params.set("services", activeServices.join(","));

    const res = await fetch(`/api/hotels?${params.toString()}`);
    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "No se pudieron cargar hoteles");
      return;
    }

    setFilteredHotels(data.hotels || []);
    setSelectedIds((prev) => prev.filter((id) => (data.hotels || []).some((hotel: Hotel) => hotel.id === id)));
    setComparisonHotels([]);
  }

  async function filterHotels() {
    await fetchHotels();
  }

  function toggleService(service: string) {
    setServices((current) =>
      current.includes(service)
        ? current.filter((item) => item !== service)
        : [...current, service]
    );
  }

  function toggleHotelForCompare(hotelId: string) {
    setError("");
    setComparisonHotels([]);

    setSelectedIds((current) => {
      if (current.includes(hotelId)) return current.filter((id) => id !== hotelId);
      if (current.length >= 3) {
        setError("You can compare up to 3 hotels.");
        return current;
      }
      return [...current, hotelId];
    });
  }

  async function runComparison() {
    if (selectedIds.length < 2) {
      setError("Select at least 2 hotels to compare.");
      return;
    }

    setComparing(true);
    setError("");

    const res = await fetch("/api/hotels/compare", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ hotelIds: selectedIds }),
    });

    const data = await res.json();
    setComparing(false);

    if (!res.ok) {
      setError(data.error || "No se pudo realizar la comparación");
      return;
    }

    setComparisonHotels(data.hotels || []);
  }

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void fetchHotels();
    }, 0);

    return () => {
      window.clearTimeout(timeoutId);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen relative overflow-hidden text-[#153243]">
      <div className="absolute inset-0 hero-grid opacity-30" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(180,184,171,0.34),_transparent_40%),radial-gradient(circle_at_top_right,_rgba(40,75,99,0.1),_transparent_35%),linear-gradient(180deg,_#eef0eb,_#f4f9e9)]" />

      <div className="relative z-10 mx-auto w-full max-w-6xl px-4 py-10 md:px-8 md:py-14">
        <header className="mb-10 flex flex-col gap-5 border-b border-[#153243]/15 pb-7 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-[#284B63]/75">Wave Boutique Hotels</p>
            <h1 className="font-display mt-2 text-3xl md:text-5xl font-semibold tracking-tight text-[#153243]">
              Boutique Hotel Search and Compare
            </h1>
            <p className="mt-3 max-w-2xl text-sm md:text-[15px] text-[#284B63]/85 leading-7">
              Busca, filtra y compara hoteles boutique de forma clara y directa.
            </p>
          </div>
          <Link
            href="/dashboard"
            className="inline-flex items-center justify-center rounded-full border-2 border-[#153243] bg-[#EEF0EB] px-5 py-2.5 text-sm font-semibold text-[#153243] transition hover:bg-[#F4F9E9]"
          >
            Ver mi perfil
          </Link>
        </header>

        {comparisonHotels.length > 0 && (
          <section className="mb-8 rounded-[1.5rem] border border-[#153243]/20 bg-[#F4F9E9]/90 p-5 md:p-7">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-display text-xl md:text-2xl font-semibold text-[#153243]">Comparison</h2>
              <p className="text-xs uppercase tracking-[0.2em] text-[#284B63]/75">{comparisonHotels.length} hoteles seleccionados</p>
            </div>
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full border-collapse text-center text-sm text-[#153243] [&_th]:align-middle [&_td]:align-middle [&_th]:border-l [&_td]:border-l [&_th]:border-[#153243]/14 [&_td]:border-[#153243]/14 [&_th:first-child]:border-l-0 [&_td:first-child]:border-l-0">
                <thead>
                  <tr>
                    <th className="border-b border-[#153243]/15 bg-[#EEF0EB] px-3 py-2 text-center text-xs font-bold uppercase tracking-[0.2em] text-[#284B63]">Metric</th>
                    {comparisonHotels.map((hotel, index) => {
                      const style = COMPARISON_COLUMN_STYLES[index % COMPARISON_COLUMN_STYLES.length];
                      return (
                      <th key={hotel.id} className={`border-b px-3 py-2 text-center text-xs font-bold uppercase tracking-[0.15em] ${style.header}`}>
                        {hotel.name}
                      </th>
                    );})}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border-b border-[#153243]/14 bg-[#EEF0EB] px-3 py-3 text-xs font-bold uppercase tracking-[0.14em] text-[#284B63]">Location</td>
                    {comparisonHotels.map((hotel, index) => {
                      const style = COMPARISON_COLUMN_STYLES[index % COMPARISON_COLUMN_STYLES.length];
                      return (
                      <td key={hotel.id} className={`border-b border-[#153243]/14 px-3 py-3 font-medium text-[#153243] ${style.cell}`}>{hotel.location}</td>
                    );})}
                  </tr>
                  <tr>
                    <td className="border-b border-[#153243]/14 bg-[#EEF0EB] px-3 py-3 text-xs font-bold uppercase tracking-[0.14em] text-[#284B63]">Price / Night</td>
                    {comparisonHotels.map((hotel, index) => {
                      const style = COMPARISON_COLUMN_STYLES[index % COMPARISON_COLUMN_STYLES.length];
                      const isHighest = hotel.price === maxComparisonPrice;
                      return (
                      <td key={hotel.id} className={`border-b border-[#153243]/14 px-3 py-3 ${isHighest ? "font-bold text-[#153243]" : "font-medium text-[#153243]"} ${style.cell}`}>${hotel.price.toFixed(0)}</td>
                    );})}
                  </tr>
                  <tr>
                    <td className="border-b border-[#153243]/14 bg-[#EEF0EB] px-3 py-3 text-xs font-bold uppercase tracking-[0.14em] text-[#284B63]">Experience</td>
                    {comparisonHotels.map((hotel, index) => {
                      const style = COMPARISON_COLUMN_STYLES[index % COMPARISON_COLUMN_STYLES.length];
                      return (
                      <td key={hotel.id} className={`border-b border-[#153243]/14 px-3 py-3 font-medium text-[#153243] ${style.cell}`}>{EXPERIENCE_LABELS[hotel.experienceType]}</td>
                    );})}
                  </tr>
                  <tr>
                    <td className="border-b border-[#153243]/14 bg-[#EEF0EB] px-3 py-3 text-xs font-bold uppercase tracking-[0.14em] text-[#284B63]">Stars</td>
                    {comparisonHotels.map((hotel, index) => {
                      const style = COMPARISON_COLUMN_STYLES[index % COMPARISON_COLUMN_STYLES.length];
                      const isHighest = hotel.stars === maxComparisonStars;
                      return (
                      <td key={hotel.id} className={`border-b border-[#153243]/14 px-3 py-3 ${isHighest ? "font-bold text-[#153243]" : "font-medium text-[#153243]"} ${style.cell}`}>{"★".repeat(hotel.stars)}</td>
                    );})}
                  </tr>
                  <tr>
                    <td className="border-b border-[#153243]/14 bg-[#EEF0EB] px-3 py-3 text-xs font-bold uppercase tracking-[0.14em] text-[#284B63]">Services</td>
                    {comparisonHotels.map((hotel, index) => {
                      const style = COMPARISON_COLUMN_STYLES[index % COMPARISON_COLUMN_STYLES.length];
                      return (
                      <td key={hotel.id} className={`border-b border-[#153243]/14 px-3 py-3 font-medium text-[#153243] ${style.cell}`}>{hotel.services.join(", ")}</td>
                    );})}
                  </tr>
                  <tr>
                    <td className="bg-[#EEF0EB] px-3 py-3 text-xs font-bold uppercase tracking-[0.14em] text-[#284B63]">Exclusive Features</td>
                    {comparisonHotels.map((hotel, index) => {
                      const style = COMPARISON_COLUMN_STYLES[index % COMPARISON_COLUMN_STYLES.length];
                      return (
                      <td key={hotel.id} className={`px-3 py-3 font-medium text-[#153243] ${style.cell}`}>{hotel.exclusiveFeatures.join(", ")}</td>
                    );})}
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        )}

        <section className="panel rounded-[1.5rem] p-5 md:p-7">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-[0.14em] text-[#284B63]">Location</label>
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Santiago, Valparaiso, Pucon"
                className="field w-full rounded-2xl px-3 py-2.5 text-sm"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-[0.14em] text-[#284B63]">Experience</label>
              <select
                value={experienceType}
                onChange={(e) => setExperienceType(e.target.value)}
                className="field w-full rounded-2xl px-3 py-2.5 text-sm"
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
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-[0.14em] text-[#284B63]">Min Price</label>
              <input
                type="number"
                min={0}
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="field w-full rounded-2xl px-3 py-2.5 text-sm"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-[0.14em] text-[#284B63]">Max Price</label>
              <input
                type="number"
                min={0}
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="field w-full rounded-2xl px-3 py-2.5 text-sm"
              />
            </div>
          </div>

          <div className="mt-5">
            <p className="mb-2.5 text-xs font-bold uppercase tracking-[0.14em] text-[#284B63]">Services</p>
            <div className="flex flex-wrap gap-2">
              {SERVICES.map((service) => {
                const active = services.includes(service);
                return (
                  <button
                    key={service}
                    type="button"
                    onClick={() => toggleService(service)}
                    className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                      active
                        ? "border-2 border-[#153243] bg-[#284B63] text-[#F4F9E9]"
                        : "border-[#153243]/25 bg-[#EEF0EB] text-[#153243] hover:bg-[#F4F9E9]"
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
              type="button"
              onClick={filterHotels}
              disabled={loading}
              className="rounded-full border-2 border-[#153243] bg-[#284B63] px-5 py-2.5 text-sm font-semibold text-[#F4F9E9] transition hover:bg-[#153243]"
            >
              {loading ? "Loading..." : "Apply Filters"}
            </button>
            <button
              type="button"
              onClick={async () => {
                const resetLocation = "";
                const resetExperienceType = "";
                const resetMinPrice = "0";
                const resetMaxPrice = "999999";
                const resetServices: string[] = [];

                setLocation(resetLocation);
                setExperienceType(resetExperienceType);
                setMinPrice(resetMinPrice);
                setMaxPrice(resetMaxPrice);
                setServices(resetServices);
                setSelectedIds([]);
                setComparisonHotels([]);
                setError("");

                await fetchHotels({
                  location: resetLocation,
                  experienceType: resetExperienceType,
                  minPrice: resetMinPrice,
                  maxPrice: resetMaxPrice,
                  services: resetServices,
                });
              }}
              className="rounded-full border-2 border-[#153243] bg-[#EEF0EB] px-5 py-2.5 text-sm font-semibold text-[#153243] transition hover:bg-[#F4F9E9]"
            >
              Clear
            </button>
          </div>

          {error && <p className="mt-4 rounded-2xl border border-[#153243]/25 bg-[#B4B8AB]/25 px-3 py-2 text-sm text-[#153243]">{error}</p>}
        </section>

        <div className="mt-7 mb-3 flex justify-center">
          <button
            type="button"
            onClick={runComparison}
            disabled={selectedIds.length < 2 || comparing}
            className={`rounded-full px-7 py-3 text-sm font-semibold transition-all duration-300 ${
              selectedIds.length >= 2
                ? "border-2 border-[#153243] bg-[#284B63] text-[#F4F9E9] shadow-[0_0_0_1px_rgba(21,50,67,0.2),0_12px_28px_rgba(21,50,67,0.18)] hover:bg-[#153243]"
                : "border-2 border-[#153243]/20 bg-[#EEF0EB] text-[#284B63]/70"
            }`}
          >
            {comparing ? "Comparing..." : `Compare Selected (${selectedIds.length})`}
          </button>
        </div>

        <div className="mb-6 rounded-2xl border border-[#153243]/16 bg-[#EEF0EB] px-4 py-3.5">
          <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#284B63]">Selected Hotels</p>
          {selectedHotels.length > 0 ? (
            <div className="mt-2 flex flex-wrap gap-2">
              {selectedHotels.map((hotel) => (
                <span key={hotel.id} className="rounded-full border border-[#153243]/20 bg-[#F4F9E9] px-3 py-1 text-xs font-medium text-[#153243]">
                  {hotel.name}
                </span>
              ))}
            </div>
          ) : (
            <p className="mt-1 text-sm text-[#284B63]/80">Aun no has seleccionado hoteles.</p>
          )}
        </div>

        <section className="mt-8">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="font-display text-2xl md:text-3xl font-semibold text-[#153243]">Results ({filteredHotels.length})</h2>
            <div className="flex items-center gap-2">
              <span className="rounded-full border border-[#153243]/20 bg-[#EEF0EB] px-3 py-1 text-xs font-semibold text-[#153243]">
                Selected: {selectedHotels.length}
              </span>
              <p className="text-xs uppercase tracking-[0.25em] text-[#284B63]/75">Ready mode</p>
            </div>
          </div>

          {filteredHotels.length === 0 ? (
            <div className="panel rounded-3xl p-10 text-center text-[#284B63]">
              No hotels found with the current filters.
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {filteredHotels.map((hotel) => {
                const selected = selectedIds.includes(hotel.id);
                return (
                  <article
                    key={hotel.id}
                    className={`rounded-3xl border p-5 transition ${
                      selected
                        ? "border-[#153243]/40 bg-[#D9E0D4] shadow-[0_16px_34px_rgba(21,50,67,0.18)]"
                        : "border-[#153243]/16 bg-[#EEF0EB] hover:bg-[#DDE4D8] hover:border-[#153243]/34 hover:shadow-[0_10px_22px_rgba(21,50,67,0.14)]"
                    }`}
                  >
                    <div
                      onClick={() => toggleHotelForCompare(hotel.id)}
                      role="button"
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          toggleHotelForCompare(hotel.id);
                        }
                      }}
                      className="cursor-pointer"
                    >
                      <div className="mb-3 flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <h3 className="font-display text-xl font-semibold text-[#153243] leading-tight line-clamp-2">{hotel.name}</h3>
                          <p className="text-xs uppercase tracking-[0.14em] text-[#284B63]/80">{hotel.location}</p>
                        </div>
                        <span
                          className={`shrink-0 whitespace-nowrap rounded-full px-3 py-1 text-[11px] font-semibold ${
                            selected
                              ? "border border-[#153243] bg-[#284B63] text-[#F4F9E9]"
                              : "border border-[#153243]/20 bg-[#EEF0EB] text-[#284B63]"
                          }`}
                        >
                          {selected ? "Selected" : "Click to compare"}
                        </span>
                      </div>

                      <p className="line-clamp-3 text-sm text-[#284B63]/88 leading-7">{hotel.description}</p>

                      <div className="mt-4 flex flex-wrap gap-2">
                        <span className="rounded-full border border-[#153243] bg-[#284B63] px-2.5 py-1 text-xs font-semibold text-[#F4F9E9]">
                          ${hotel.price.toFixed(0)} / night
                        </span>
                        <span className="rounded-full border border-[#153243]/18 bg-[#F4F9E9] px-2.5 py-1 text-xs font-semibold text-[#153243]">
                          {EXPERIENCE_LABELS[hotel.experienceType]}
                        </span>
                        <span className="rounded-full border border-[#153243]/18 bg-[#F4F9E9] px-2.5 py-1 text-xs font-semibold text-[#153243]">
                          {"★".repeat(hotel.stars)}
                        </span>
                      </div>

                      <div className="mt-4">
                        <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.14em] text-[#284B63]">Services</p>
                        <div className="flex flex-wrap gap-1.5">
                          {hotel.services.map((service) => (
                            <span key={service} className="rounded-full border border-[#153243]/18 bg-[#EEF0EB] px-2 py-0.5 text-xs text-[#153243]">
                              {service}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Botón Reservar — fuera del área clickeable de compare */}
                    <div className="mt-4 pt-4 border-t border-[#153243]/15">
                      <Link
                        href={`/hotels/${hotel.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="block w-full text-center rounded-full border-2 border-[#153243] bg-[#284B63] hover:bg-[#153243] text-[#F4F9E9] text-xs font-bold py-2.5 transition-colors"
                      >
                        Reservar ahora →
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
