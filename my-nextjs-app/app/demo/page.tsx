"use client";

import { Link } from "@/i18n/navigation";
import { useMemo, useState } from "react";

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

const DEMO_HOTELS: Hotel[] = [
  {
    id: "demo-1",
    name: "Casa Ladera Boutique",
    description: "Urban boutique hotel with mountain view suites and private terraces.",
    location: "Santiago",
    experienceType: "ROMANTIC",
    price: 280,
    stars: 5,
    services: ["Spa", "Rooftop", "Airport Transfer"],
    exclusiveFeatures: ["Private terrace", "In-room aroma ritual"],
  },
  {
    id: "demo-2",
    name: "Vina Secreta Lodge",
    description: "Countryside retreat between vineyards with guided tastings and chef pairings.",
    location: "Valparaiso",
    experienceType: "GASTRONOMIC",
    price: 340,
    stars: 5,
    services: ["Winery", "Chef Table", "Pool"],
    exclusiveFeatures: ["Reserve wine cellar", "Sunset tasting"],
  },
  {
    id: "demo-3",
    name: "Bosque Termal House",
    description: "Forest cabins with thermal circuits, yoga decks and wellness programs.",
    location: "Pucon",
    experienceType: "WELLNESS",
    price: 220,
    stars: 4,
    services: ["Spa", "Yoga", "Pool"],
    exclusiveFeatures: ["Thermal ritual", "Guided breathwork"],
  },
  {
    id: "demo-4",
    name: "Risco Aventura Suites",
    description: "Design lodge next to national park trails, ideal for active travelers.",
    location: "Torres del Paine",
    experienceType: "ADVENTURE",
    price: 300,
    stars: 4,
    services: ["Airport Transfer", "Pet Friendly"],
    exclusiveFeatures: ["Expedition concierge", "Private trekking routes"],
  },
];

const SERVICES = ["Spa", "Rooftop", "Pool", "Chef Table", "Airport Transfer", "Pet Friendly", "Yoga", "Winery"];

const COMPARISON_COLUMN_STYLES = [
  {
    header: "bg-sky-500/18 text-sky-200 border-sky-300/30",
    cell: "bg-sky-500/8",
  },
  {
    header: "bg-emerald-500/18 text-emerald-200 border-emerald-300/30",
    cell: "bg-emerald-500/8",
  },
  {
    header: "bg-amber-500/18 text-amber-200 border-amber-300/30",
    cell: "bg-amber-500/8",
  },
];

export default function DemoPage() {
  const [location, setLocation] = useState("");
  const [experienceType, setExperienceType] = useState("");
  const [minPrice, setMinPrice] = useState("80");
  const [maxPrice, setMaxPrice] = useState("650");
  const [services, setServices] = useState<string[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [filteredHotels, setFilteredHotels] = useState<Hotel[]>(DEMO_HOTELS);
  const [comparisonHotels, setComparisonHotels] = useState<Hotel[]>([]);
  const [error, setError] = useState("");

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

  function filterHotels() {
    const min = Number(minPrice || 0);
    const max = Number(maxPrice || 999999);

    const result = DEMO_HOTELS.filter((hotel) => {
      const locationMatch = !location.trim()
        ? true
        : hotel.location.toLowerCase().includes(location.trim().toLowerCase());
      const experienceMatch = !experienceType || hotel.experienceType === experienceType;
      const priceMatch = hotel.price >= min && hotel.price <= max;
      const servicesMatch = services.length === 0 || services.every((service) => hotel.services.includes(service));
      return locationMatch && experienceMatch && priceMatch && servicesMatch;
    });

    setFilteredHotels(result);
    setSelectedIds((prev) => prev.filter((id) => result.some((hotel) => hotel.id === id)));
    setComparisonHotels([]);
    setError("");
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

  function runComparison() {
    if (selectedIds.length < 2) {
      setError("Select at least 2 hotels to compare.");
      return;
    }

    setError("");
    setComparisonHotels(filteredHotels.filter((hotel) => selectedIds.includes(hotel.id)));
  }

  return (
    <div className="min-h-screen relative overflow-hidden text-slate-100">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(148,163,184,0.12),_transparent_45%),linear-gradient(180deg,_#0b0f16,_#0f1724)]" />

      <div className="relative z-10 mx-auto w-full max-w-5xl px-4 py-8 md:px-8 md:py-12">
        <header className="mb-6 flex flex-col gap-3 border-b border-white/10 pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.28em] text-slate-500">Wave Boutique Hotels</p>
            <h1 className="mt-2 text-2xl md:text-4xl font-black tracking-tight text-white">
              Boutique Hotel Search and Compare
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-400 leading-6">
              Busca, filtra y compara hoteles boutique de forma clara y directa.
            </p>
          </div>
          <Link
            href="/auth/login"
            className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-slate-200 transition hover:bg-white/10 hover:text-white"
          >
            Login
          </Link>
        </header>

        {comparisonHotels.length > 0 && (
          <section className="mb-6 rounded-[1.25rem] border border-white/20 bg-slate-900/40 p-5 md:p-6">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg md:text-xl font-bold text-white">Comparison</h2>
              <p className="text-xs text-slate-400">{comparisonHotels.length} hoteles seleccionados</p>
            </div>
            <div className="mt-4 overflow-x-auto">
              <table className="min-w-full border-collapse text-center text-sm text-slate-200 [&_th]:align-middle [&_td]:align-middle [&_th]:border-l [&_td]:border-l [&_th]:border-white/10 [&_td]:border-white/10 [&_th:first-child]:border-l-0 [&_td:first-child]:border-l-0">
                <thead>
                  <tr>
                    <th className="border-b border-white/10 bg-slate-900/50 px-3 py-2 text-center text-xs font-bold uppercase tracking-[0.18em] text-slate-300">Metric</th>
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
                    <td className="border-b border-white/10 bg-slate-900/35 px-3 py-3 text-xs font-bold uppercase tracking-[0.1em] text-slate-300">Location</td>
                    {comparisonHotels.map((hotel, index) => {
                      const style = COMPARISON_COLUMN_STYLES[index % COMPARISON_COLUMN_STYLES.length];
                      return (
                      <td key={hotel.id} className={`border-b border-white/10 px-3 py-3 font-medium text-slate-100 ${style.cell}`}>{hotel.location}</td>
                    );})}
                  </tr>
                  <tr>
                    <td className="border-b border-white/10 bg-slate-900/35 px-3 py-3 text-xs font-bold uppercase tracking-[0.1em] text-slate-300">Price / Night</td>
                    {comparisonHotels.map((hotel, index) => {
                      const style = COMPARISON_COLUMN_STYLES[index % COMPARISON_COLUMN_STYLES.length];
                      const isHighest = hotel.price === maxComparisonPrice;
                      return (
                      <td key={hotel.id} className={`border-b border-white/10 px-3 py-3 ${isHighest ? "font-bold text-emerald-200" : "font-medium text-slate-100"} ${style.cell}`}>${hotel.price.toFixed(0)}</td>
                    );})}
                  </tr>
                  <tr>
                    <td className="border-b border-white/10 bg-slate-900/35 px-3 py-3 text-xs font-bold uppercase tracking-[0.1em] text-slate-300">Experience</td>
                    {comparisonHotels.map((hotel, index) => {
                      const style = COMPARISON_COLUMN_STYLES[index % COMPARISON_COLUMN_STYLES.length];
                      return (
                      <td key={hotel.id} className={`border-b border-white/10 px-3 py-3 font-medium text-slate-100 ${style.cell}`}>{EXPERIENCE_LABELS[hotel.experienceType]}</td>
                    );})}
                  </tr>
                  <tr>
                    <td className="border-b border-white/10 bg-slate-900/35 px-3 py-3 text-xs font-bold uppercase tracking-[0.1em] text-slate-300">Stars</td>
                    {comparisonHotels.map((hotel, index) => {
                      const style = COMPARISON_COLUMN_STYLES[index % COMPARISON_COLUMN_STYLES.length];
                      const isHighest = hotel.stars === maxComparisonStars;
                      return (
                      <td key={hotel.id} className={`border-b border-white/10 px-3 py-3 ${isHighest ? "font-bold text-emerald-200" : "font-medium text-slate-100"} ${style.cell}`}>{"★".repeat(hotel.stars)}</td>
                    );})}
                  </tr>
                  <tr>
                    <td className="border-b border-white/10 bg-slate-900/35 px-3 py-3 text-xs font-bold uppercase tracking-[0.1em] text-slate-300">Services</td>
                    {comparisonHotels.map((hotel, index) => {
                      const style = COMPARISON_COLUMN_STYLES[index % COMPARISON_COLUMN_STYLES.length];
                      return (
                      <td key={hotel.id} className={`border-b border-white/10 px-3 py-3 font-medium text-slate-100 ${style.cell}`}>{hotel.services.join(", ")}</td>
                    );})}
                  </tr>
                  <tr>
                    <td className="bg-slate-900/35 px-3 py-3 text-xs font-bold uppercase tracking-[0.1em] text-slate-300">Exclusive Features</td>
                    {comparisonHotels.map((hotel, index) => {
                      const style = COMPARISON_COLUMN_STYLES[index % COMPARISON_COLUMN_STYLES.length];
                      return (
                      <td key={hotel.id} className={`px-3 py-3 font-medium text-slate-100 ${style.cell}`}>{hotel.exclusiveFeatures.join(", ")}</td>
                    );})}
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        )}

        <section className="panel rounded-[1.25rem] p-5 md:p-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-400">Location</label>
              <input
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Santiago, Valparaiso, Pucon"
                className="field w-full rounded-2xl px-3 py-2.5 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-400">Experience</label>
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
              <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-400">Min Price</label>
              <input
                type="number"
                min={0}
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="field w-full rounded-2xl px-3 py-2.5 text-sm"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wider text-slate-400">Max Price</label>
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
            <p className="mb-2 text-xs font-bold uppercase tracking-wider text-slate-400">Services</p>
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
                        ? "border-amber-400 bg-amber-400 text-slate-950"
                        : "border-white/10 bg-white/5 text-slate-200 hover:bg-white/10"
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
              className="rounded-full bg-slate-100 px-5 py-2.5 text-sm font-semibold text-slate-900 transition hover:bg-white"
            >
              Apply Filters
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
                setFilteredHotels(DEMO_HOTELS);
                setComparisonHotels([]);
                setError("");
              }}
              className="rounded-full border border-white/10 bg-white/5 px-5 py-2.5 text-sm font-semibold text-slate-100 transition hover:bg-white/10"
            >
              Clear
            </button>
          </div>

          {error && <p className="mt-4 rounded-2xl border border-red-500/25 bg-red-500/10 px-3 py-2 text-sm text-red-200">{error}</p>}
        </section>

        <div className="mt-5 mb-2 flex justify-center">
          <button
            type="button"
            onClick={runComparison}
            disabled={selectedIds.length < 2}
            className={`rounded-full px-7 py-3 text-sm font-semibold transition-all duration-300 ${
              selectedIds.length >= 2
                ? "bg-slate-100 text-slate-900 shadow-[0_0_0_1px_rgba(255,255,255,0.35),0_0_24px_rgba(148,163,184,0.45)] hover:bg-white"
                : "border border-white/10 bg-white/5 text-slate-400"
            }`}
          >
            Compare Selected ({selectedIds.length})
          </button>
        </div>

        <div className="mb-4 rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
          <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-slate-400">Selected Hotels</p>
          {selectedHotels.length > 0 ? (
            <div className="mt-2 flex flex-wrap gap-2">
              {selectedHotels.map((hotel) => (
                <span key={hotel.id} className="rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-medium text-slate-100">
                  {hotel.name}
                </span>
              ))}
            </div>
          ) : (
            <p className="mt-1 text-sm text-slate-400">Aun no has seleccionado hoteles.</p>
          )}
        </div>

        <section className="mt-8">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-xl font-extrabold text-white">Results ({filteredHotels.length})</h2>
            <div className="flex items-center gap-2">
              <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-slate-200">
                Selected: {selectedHotels.length}
              </span>
              <p className="text-xs uppercase tracking-[0.25em] text-slate-500">Demo mode</p>
            </div>
          </div>

          {filteredHotels.length === 0 ? (
            <div className="panel rounded-3xl p-10 text-center text-slate-300">
              No hotels found with the current filters.
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {filteredHotels.map((hotel) => {
                const selected = selectedIds.includes(hotel.id);
                return (
                  <article
                    key={hotel.id}
                    onClick={() => toggleHotelForCompare(hotel.id)}
                    className={`rounded-3xl border p-5 transition ${
                      selected
                        ? "border-slate-300/40 bg-white/10 shadow-lg shadow-black/25"
                        : "border-white/10 bg-white/[0.04] hover:bg-white/[0.08] hover:border-white/20"
                    }`}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        toggleHotelForCompare(hotel.id);
                      }
                    }}
                  >
                    <div className="mb-3 flex items-start justify-between gap-3">
                      <div>
                        <h3 className="text-lg font-black text-white">{hotel.name}</h3>
                        <p className="text-xs text-slate-400">{hotel.location}</p>
                      </div>
                      <span
                        className={`rounded-full px-3 py-1 text-[11px] font-semibold ${
                          selected
                            ? "bg-slate-100 text-slate-900"
                            : "bg-white/10 text-slate-300"
                        }`}
                      >
                        {selected ? "Selected" : "Click to compare"}
                      </span>
                    </div>

                    <p className="line-clamp-3 text-sm text-slate-300 leading-6">{hotel.description}</p>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <span className="rounded-full bg-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-900">
                        ${hotel.price.toFixed(0)} / night
                      </span>
                      <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs font-semibold text-slate-100">
                        {EXPERIENCE_LABELS[hotel.experienceType]}
                      </span>
                      <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs font-semibold text-slate-100">
                        {"★".repeat(hotel.stars)}
                      </span>
                    </div>

                    <div className="mt-4">
                      <p className="mb-1 text-[11px] font-bold uppercase tracking-wider text-slate-500">Services</p>
                      <div className="flex flex-wrap gap-1.5">
                        {hotel.services.map((service) => (
                          <span key={service} className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-xs text-slate-200">
                            {service}
                          </span>
                        ))}
                      </div>
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
