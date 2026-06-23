"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import GoogleMapComponent from "@/app/components/GoogleMap";

type ExperienceType = "RELAX" | "WELLNESS" | "GASTRONOMIC" | "ADVENTURE" | "ROMANTIC" | "CULTURAL";

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
  latitude?: number;
  longitude?: number;
};

const EXPERIENCE_LABELS: Record<ExperienceType, string> = {
  RELAX: "Relax", WELLNESS: "Wellness", GASTRONOMIC: "Gastronómico",
  ADVENTURE: "Aventura", ROMANTIC: "Romántico", CULTURAL: "Cultural",
};

const EXPERIENCE_FALLBACK_IMAGES: Record<ExperienceType, string> = {
  RELAX: "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800&q=80",
  WELLNESS: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&q=80",
  GASTRONOMIC: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80",
  ADVENTURE: "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=800&q=80",
  ROMANTIC: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80",
  CULTURAL: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80",
};

const SERVICES = ["Spa", "Rooftop", "Pool", "Chef Table", "Airport Transfer", "Pet Friendly", "Yoga", "Winery"];

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
    () => filteredHotels.filter((h) => selectedIds.includes(h.id)),
    [filteredHotels, selectedIds]
  );

  const maxComparisonPrice = useMemo(() =>
    comparisonHotels.length ? Math.max(...comparisonHotels.map((h) => h.price)) : null,
    [comparisonHotels]
  );

  const maxComparisonStars = useMemo(() =>
    comparisonHotels.length ? Math.max(...comparisonHotels.map((h) => h.stars)) : null,
    [comparisonHotels]
  );

  function getHotelImage(hotel: Hotel) {
    return hotel.images?.[0] || EXPERIENCE_FALLBACK_IMAGES[hotel.experienceType] || EXPERIENCE_FALLBACK_IMAGES.RELAX;
  }

  async function fetchHotels(options?: {
    location?: string; experienceType?: string; minPrice?: string; maxPrice?: string; services?: string[];
  }) {
    setLoading(true); setError("");
    const al = options?.location ?? location;
    const ae = options?.experienceType ?? experienceType;
    const ami = options?.minPrice ?? minPrice;
    const ama = options?.maxPrice ?? maxPrice;
    const as_ = options?.services ?? services;
    const params = new URLSearchParams();
    if (al.trim()) params.set("location", al.trim());
    if (ae) params.set("experienceType", ae);
    params.set("minPrice", ami || "0");
    params.set("maxPrice", ama || "999999");
    if (as_.length > 0) params.set("services", as_.join(","));
    const res = await fetch(`/api/hotels?${params.toString()}`);
    const data = await res.json();
    setLoading(false);
    if (!res.ok) { setError(data.error || "Error al cargar hoteles"); return; }
    setFilteredHotels(data.hotels || []);
    setSelectedIds((prev) => prev.filter((id) => (data.hotels || []).some((h: Hotel) => h.id === id)));
    setComparisonHotels([]);
  }

  function toggleService(service: string) {
    setServices((cur) => cur.includes(service) ? cur.filter((s) => s !== service) : [...cur, service]);
  }

  function toggleHotelForCompare(hotelId: string) {
    setError(""); setComparisonHotels([]);
    setSelectedIds((cur) => {
      if (cur.includes(hotelId)) return cur.filter((id) => id !== hotelId);
      if (cur.length >= 3) { setError("Puedes comparar hasta 3 hoteles."); return cur; }
      return [...cur, hotelId];
    });
  }

  async function runComparison() {
    if (selectedIds.length < 2) { setError("Selecciona al menos 2 hoteles."); return; }
    setComparing(true); setError("");
    const res = await fetch("/api/hotels/compare", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ hotelIds: selectedIds }) });
    const data = await res.json();
    setComparing(false);
    if (!res.ok) { setError(data.error || "Error en comparación"); return; }
    setComparisonHotels(data.hotels || []);
  }

  useEffect(() => {
    const t = window.setTimeout(() => void fetchHotels(), 0);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const inputClass = "w-full bg-white border border-[#0B1F2D]/10 rounded-2xl px-4 py-2.5 text-sm text-[#0B1F2D] outline-none focus:border-[#C9A87C] focus:ring-4 focus:ring-[#C9A87C]/15 transition-all";
  const labelClass = "mb-1.5 block text-[10px] font-bold uppercase tracking-[0.18em] text-[#0B1F2D]/50";

  return (
    <div className="min-h-screen bg-[#FAF6F0] text-[#0B1F2D]">
      <div className="mx-auto w-full max-w-7xl px-4 py-10 md:px-8 md:py-14">

        {/* Tabla comparación */}
        {comparisonHotels.length > 0 && (
          <section className="mb-10 rounded-3xl border border-[#0B1F2D]/10 bg-white overflow-hidden">
            <div className="flex items-center justify-between gap-3 px-6 py-4 border-b border-[#0B1F2D]/8">
              <h2 className="font-display text-xl font-bold text-[#0B1F2D]">Comparación</h2>
              <span className="text-xs text-[#0B1F2D]/40 uppercase tracking-widest">{comparisonHotels.length} hoteles</span>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse text-sm text-center">
                <thead>
                  <tr>
                    <th className="bg-[#FAF6F0] px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-[#0B1F2D]/40">Métrica</th>
                    {comparisonHotels.map((h) => (
                      <th key={h.id} className="bg-[#0B1F2D] px-4 py-3 text-xs font-bold uppercase tracking-wider text-[#FAF6F0]">
                        {h.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    { label: "Ubicación", fn: (h: Hotel) => h.location },
                    { label: "Precio/noche", fn: (h: Hotel) => `$${h.price.toFixed(0)}`, highlight: (h: Hotel) => h.price === maxComparisonPrice },
                    { label: "Experiencia", fn: (h: Hotel) => EXPERIENCE_LABELS[h.experienceType] },
                    { label: "Estrellas", fn: (h: Hotel) => "★".repeat(h.stars), highlight: (h: Hotel) => h.stars === maxComparisonStars },
                    { label: "Servicios", fn: (h: Hotel) => h.services.join(", ") },
                    { label: "Exclusivo", fn: (h: Hotel) => h.exclusiveFeatures.join(", ") },
                  ].map((row, ri) => (
                    <tr key={row.label} className={ri % 2 === 0 ? "bg-white" : "bg-[#FAF6F0]"}>
                      <td className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-[#0B1F2D]/40">{row.label}</td>
                      {comparisonHotels.map((h) => (
                        <td key={h.id} className={`px-4 py-3 font-medium ${row.highlight?.(h) ? "text-[#C9A87C] font-bold" : "text-[#0B1F2D]"}`}>
                          {row.fn(h)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* Filtros */}
        <section className="bg-white rounded-3xl border border-[#0B1F2D]/10 p-6 md:p-8 mb-8 shadow-sm">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className={labelClass}>Ubicación</label>
              <input value={location} onChange={(e) => setLocation(e.target.value)}
                placeholder="Santiago, Pucón, Atacama..." className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Experiencia</label>
              <select value={experienceType} onChange={(e) => setExperienceType(e.target.value)} className={inputClass}>
                <option value="">Todas</option>
                {Object.entries(EXPERIENCE_LABELS).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Precio mín.</label>
              <input type="number" min={0} value={minPrice} onChange={(e) => setMinPrice(e.target.value)} className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Precio máx.</label>
              <input type="number" min={0} value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} className={inputClass} />
            </div>
          </div>

          <div className="mt-5">
            <p className={labelClass}>Servicios</p>
            <div className="flex flex-wrap gap-2">
              {SERVICES.map((s) => {
                const active = services.includes(s);
                return (
                  <button key={s} type="button" onClick={() => toggleService(s)}
                    className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all border ${active
                      ? "bg-[#0B1F2D] text-[#FAF6F0] border-[#0B1F2D]"
                      : "bg-white text-[#0B1F2D] border-[#0B1F2D]/15 hover:border-[#C9A87C] hover:text-[#C9A87C]"
                      }`}>
                    {s}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button type="button" onClick={() => fetchHotels()} disabled={loading}
              className="bg-[#0B1F2D] hover:bg-[#1B4965] text-[#FAF6F0] text-sm font-semibold px-6 py-2.5 rounded-full transition-colors">
              {loading ? "Buscando..." : "Aplicar filtros"}
            </button>
            <button type="button"
              onClick={async () => {
                setLocation(""); setExperienceType(""); setMinPrice("0"); setMaxPrice("999999");
                setServices([]); setSelectedIds([]); setComparisonHotels([]); setError("");
                await fetchHotels({ location: "", experienceType: "", minPrice: "0", maxPrice: "999999", services: [] });
              }}
              className="bg-white border border-[#0B1F2D]/15 text-[#0B1F2D] text-sm font-semibold px-6 py-2.5 rounded-full hover:border-[#0B1F2D]/30 transition-colors">
              Limpiar
            </button>
          </div>

          {error && (
            <p className="mt-4 rounded-2xl bg-rose-50 border border-rose-200 px-4 py-2.5 text-sm text-rose-600">{error}</p>
          )}
        </section>

        {/* Botón comparar + seleccionados */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
          <div className="flex flex-wrap gap-2 items-center">
            {selectedHotels.length > 0 ? (
              <>
                <span className="text-xs text-[#0B1F2D]/40 uppercase tracking-wider">Seleccionados:</span>
                {selectedHotels.map((h) => (
                  <span key={h.id} className="rounded-full bg-[#0B1F2D] text-[#FAF6F0] text-xs font-medium px-3 py-1">
                    {h.name}
                  </span>
                ))}
              </>
            ) : (
              <p className="text-sm text-[#0B1F2D]/40">Haz clic en un hotel para compararlo</p>
            )}
          </div>
          <button type="button" onClick={runComparison}
            disabled={selectedIds.length < 2 || comparing}
            className={`rounded-full px-7 py-2.5 text-sm font-semibold transition-all ${selectedIds.length >= 2
              ? "bg-[#C9A87C] hover:bg-[#E8845A] text-[#0B1F2D] shadow-lg shadow-[#C9A87C]/30"
              : "bg-[#0B1F2D]/5 text-[#0B1F2D]/30 cursor-not-allowed"
              }`}>
            {comparing ? "Comparando..." : `Comparar (${selectedIds.length})`}
          </button>
        </div>

        {/* Resultados */}
        <section>
          <h2 className="font-display text-2xl font-bold text-[#0B1F2D] mb-6">
            Resultados <span className="text-[#0B1F2D]/30 font-normal text-lg">({filteredHotels.length})</span>
          </h2>

          {filteredHotels.length === 0 ? (
            <div className="rounded-3xl bg-white border border-[#0B1F2D]/8 p-16 text-center">
              <p className="font-display text-2xl text-[#0B1F2D]/40">No se encontraron hoteles</p>
              <p className="text-sm text-[#0B1F2D]/30 mt-2">Prueba ajustando los filtros</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredHotels.map((hotel) => {
                const selected = selectedIds.includes(hotel.id);
                return (
                  <article key={hotel.id}
                    className={`overflow-hidden rounded-3xl border transition-all duration-300 ${selected
                      ? "border-[#C9A87C] shadow-xl shadow-[#C9A87C]/15 bg-white"
                      : "border-[#0B1F2D]/8 bg-white hover:border-[#0B1F2D]/20 hover:shadow-lg hover:shadow-[#0B1F2D]/5"
                      }`}>

                    {/* Imagen */}
                    <div onClick={() => toggleHotelForCompare(hotel.id)}
                      className="aspect-[16/10] overflow-hidden cursor-pointer relative group"
                      role="button" tabIndex={0}
                      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggleHotelForCompare(hotel.id); } }}>
                      <img src={getHotelImage(hotel)} alt={hotel.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0B1F2D]/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                      {/* Badge experiencia */}
                      <div className="absolute top-3 left-3 bg-[#0B1F2D]/80 backdrop-blur-sm text-[#FAF6F0] text-[10px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full">
                        {EXPERIENCE_LABELS[hotel.experienceType]}
                      </div>

                      {selected && (
                        <div className="absolute top-3 right-3 bg-[#C9A87C] text-[#0B1F2D] text-xs font-bold px-3 py-1 rounded-full">
                          ✓ Seleccionado
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="p-5 cursor-pointer"
                      onClick={() => toggleHotelForCompare(hotel.id)}
                      role="button" tabIndex={0}
                      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggleHotelForCompare(hotel.id); } }}>

                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="min-w-0 flex-1">
                          <h3 className="font-display text-lg font-bold text-[#0B1F2D] leading-tight line-clamp-1">{hotel.name}</h3>
                          <p className="text-xs text-[#0B1F2D]/40 uppercase tracking-wider mt-0.5">📍 {hotel.location}</p>
                        </div>
                        <div className="flex gap-0.5 shrink-0">
                          {[...Array(hotel.stars)].map((_, i) => (
                            <span key={i} className="text-[#C9A87C] text-xs">★</span>
                          ))}
                        </div>
                      </div>

                      <p className="text-sm text-[#0B1F2D]/55 leading-relaxed line-clamp-2 mb-4">{hotel.description}</p>

                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-display text-2xl font-bold text-[#0B1F2D]">${hotel.price.toFixed(0)}</span>
                          <span className="text-xs text-[#0B1F2D]/40 ml-1">/ noche</span>
                        </div>
                        <div className="flex flex-wrap gap-1 justify-end">
                          {hotel.services.slice(0, 2).map((s) => (
                            <span key={s} className="text-[10px] bg-[#FAF6F0] border border-[#0B1F2D]/8 text-[#0B1F2D]/60 px-2 py-0.5 rounded-full">
                              {s}
                            </span>
                          ))}
                          {hotel.services.length > 2 && (
                            <span className="text-[10px] text-[#0B1F2D]/40">+{hotel.services.length - 2}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Botón */}
                    <div className="px-5 pb-5">
                      <Link href={`/hotels/${hotel.id}`} onClick={(e) => e.stopPropagation()}
                        className="block w-full text-center rounded-full bg-[#0B1F2D] hover:bg-[#1B4965] text-[#FAF6F0] text-xs font-bold py-3 transition-colors">
                        Ver detalle →
                      </Link>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>

        {/* Mapa */}
        {filteredHotels.filter((h) => h.latitude && h.longitude).length > 0 && (
          <section className="mt-12">
            <h2 className="font-display text-2xl font-bold text-[#0B1F2D] mb-4">Ubicaciones</h2>
            <div className="rounded-3xl overflow-hidden border border-[#0B1F2D]/8">
              <GoogleMapComponent hotels={filteredHotels.filter((h) => h.latitude && h.longitude) as any} />
            </div>
          </section>
        )}

      </div>
    </div>
  );
}