"use client";
// app/[locale]/admin/hotels/new/page.tsx

import { Link } from "@/i18n/navigation";
import { useRouter } from "@/i18n/navigation";
import { useState } from "react";

const EXPERIENCE_TYPES = [
  { value: "RELAX",       label: "Relax" },
  { value: "WELLNESS",    label: "Wellness" },
  { value: "GASTRONOMIC", label: "Gastronómico" },
  { value: "ADVENTURE",   label: "Aventura" },
  { value: "ROMANTIC",    label: "Romántico" },
  { value: "CULTURAL",    label: "Cultural" },
];

export default function NewHotelPage() {
  const router = useRouter();
  const [syncing, setSyncing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [mode, setMode] = useState<"choose" | "manual" | "google">("choose");

  // Campos del formulario
  const [name, setName]                     = useState("");
  const [description, setDescription]       = useState("");
  const [location, setLocation]             = useState("");
  const [address, setAddress]               = useState("");
  const [latitude, setLatitude]             = useState("");
  const [longitude, setLongitude]           = useState("");
  const [price, setPrice]                   = useState("");
  const [extraBedPrice, setExtraBedPrice]   = useState("50");
  const [stars, setStars]                   = useState("5");
  const [totalRooms, setTotalRooms]         = useState("10");
  const [experienceType, setExperienceType] = useState("RELAX");
  const [images, setImages]                 = useState("");
  const [services, setServices]             = useState("");
  const [exclusiveFeatures, setExclusiveFeatures] = useState("");

  async function handleSync() {
    setSyncing(true);
    const res = await fetch("/api/admin/sync-google-hotels", { method: "POST" });
    setSyncing(false);
    if (res.ok) {
      alert("Hoteles sincronizados exitosamente");
      router.push("/admin/hotels");
    } else {
      alert("Error al sincronizar hoteles");
    }
  }

  async function handleSubmit() {
    setSubmitting(true);
    setError("");

    const res = await fetch("/api/admin/hotels", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        description,
        location,
        address,
        latitude:  latitude  ? parseFloat(latitude)  : null,
        longitude: longitude ? parseFloat(longitude) : null,
        price:         parseFloat(price),
        extraBedPrice: parseFloat(extraBedPrice),
        stars:         parseInt(stars),
        totalRooms:    parseInt(totalRooms),
        experienceType,
        images:            images.split("\n").map((s) => s.trim()).filter(Boolean),
        services:          services.split(",").map((s) => s.trim()).filter(Boolean),
        exclusiveFeatures: exclusiveFeatures.split(",").map((s) => s.trim()).filter(Boolean),
      }),
    });

    const data = await res.json();
    setSubmitting(false);

    if (!res.ok) {
      setError(data.error || "Error al crear el hotel");
      return;
    }

    router.push("/admin/hotels");
  }

  // ── Pantalla de elección ──────────────────────────────────
  if (mode === "choose") {
    return (
      <div className="min-h-screen bg-[#FAF6F0]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
          <Link href="/admin/hotels" className="text-sm text-[#C9A87C] font-bold mb-6 inline-block">
            ← Volver a mis hoteles
          </Link>
          <h1 className="font-display text-3xl font-bold text-[#0B1F2D] mb-2">Agregar hotel</h1>
          <p className="text-[#0B1F2D]/50 text-sm mb-8">Elige cómo quieres agregar tu hotel</p>

          <div className="grid sm:grid-cols-2 gap-4">
            {/* Manual */}
            <button
              onClick={() => setMode("manual")}
              className="bg-white border-2 border-[#0B1F2D]/10 hover:border-[#C9A87C] rounded-2xl p-8 text-left transition-all hover:shadow-md group"
            >
              <div className="text-4xl mb-4">✏️</div>
              <h2 className="font-bold text-lg text-[#0B1F2D] mb-2">Creación manual</h2>
              <p className="text-sm text-[#0B1F2D]/50">Completa el formulario con los datos de tu hotel paso a paso.</p>
            </button>

            {/* Google */}
            <button
              onClick={() => setMode("google")}
              className="bg-white border-2 border-[#0B1F2D]/10 hover:border-[#C9A87C] rounded-2xl p-8 text-left transition-all hover:shadow-md group"
            >
              <div className="text-4xl mb-4">🌍</div>
              <h2 className="font-bold text-lg text-[#0B1F2D] mb-2">Importar desde Google</h2>
              <p className="text-sm text-[#0B1F2D]/50">Sincroniza hoteles boutique reales desde Google Maps automáticamente.</p>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Pantalla Google ───────────────────────────────────────
  if (mode === "google") {
    return (
      <div className="min-h-screen bg-[#FAF6F0]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
          <button onClick={() => setMode("choose")} className="text-sm text-[#C9A87C] font-bold mb-6 inline-block">
            ← Volver
          </button>
          <div className="bg-white rounded-3xl border border-[#0B1F2D]/10 p-8 shadow-sm text-center max-w-xl mx-auto">
            <div className="text-6xl mb-4">🌍</div>
            <h2 className="text-xl font-bold mb-3 text-[#0B1F2D]">Importar desde Google Maps</h2>
            <p className="text-[#0B1F2D]/50 mb-8 text-sm leading-relaxed">
              Con un solo clic buscaremos y añadiremos automáticamente hoteles boutique reales desde Google Maps, incluyendo fotos, ubicación y reseñas.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button
                onClick={handleSync}
                disabled={syncing}
                className="bg-[#0B1F2D] text-white font-bold px-8 py-3.5 rounded-xl hover:bg-[#0B1F2D]/80 disabled:opacity-50 transition-colors"
              >
                {syncing ? "Sincronizando..." : "Sincronizar desde Google"}
              </button>
              <button
                onClick={() => setMode("choose")}
                className="bg-[#FAF6F0] text-[#0B1F2D] border border-[#0B1F2D]/20 font-bold px-8 py-3.5 rounded-xl hover:bg-[#FAF6F0]/80 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Formulario manual ─────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#FAF6F0]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 space-y-6">
        <div>
          <button onClick={() => setMode("choose")} className="text-sm text-[#C9A87C] font-bold mb-6 inline-block">
            ← Volver
          </button>
          <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-[#C9A87C] mb-1">Nuevo hotel</p>
          <h1 className="font-display text-3xl font-bold text-[#0B1F2D]">Crear hotel manualmente</h1>
        </div>

        <div className="bg-white rounded-2xl border border-[#0B1F2D]/10 p-8 shadow-sm space-y-6">

          {/* Nombre */}
          <div>
            <label className="block text-xs font-bold text-[#0B1F2D]/50 mb-2 uppercase tracking-wider">Nombre del hotel *</label>
            <input
              value={name} onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Hotel Boutique Las Piedras"
              className="w-full border border-[#0B1F2D]/20 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#C9A87C] focus:ring-4 focus:ring-[#C9A87C]/20 transition-all"
            />
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-xs font-bold text-[#0B1F2D]/50 mb-2 uppercase tracking-wider">Descripción *</label>
            <textarea
              value={description} onChange={(e) => setDescription(e.target.value)}
              rows={4} placeholder="Describe la experiencia única del hotel..."
              className="w-full border border-[#0B1F2D]/20 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#C9A87C] focus:ring-4 focus:ring-[#C9A87C]/20 transition-all resize-none"
            />
          </div>

          {/* Ubicación */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#0B1F2D]/50 mb-2 uppercase tracking-wider">Ciudad / Región *</label>
              <input
                value={location} onChange={(e) => setLocation(e.target.value)}
                placeholder="Ej: Pucón, Araucanía"
                className="w-full border border-[#0B1F2D]/20 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#C9A87C] focus:ring-4 focus:ring-[#C9A87C]/20 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#0B1F2D]/50 mb-2 uppercase tracking-wider">Dirección</label>
              <input
                value={address} onChange={(e) => setAddress(e.target.value)}
                placeholder="Ej: Camino Villarrica km 15"
                className="w-full border border-[#0B1F2D]/20 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#C9A87C] focus:ring-4 focus:ring-[#C9A87C]/20 transition-all"
              />
            </div>
          </div>

          {/* Coordenadas */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#0B1F2D]/50 mb-2 uppercase tracking-wider">Latitud</label>
              <input
                type="number" value={latitude} onChange={(e) => setLatitude(e.target.value)}
                placeholder="-39.2811"
                className="w-full border border-[#0B1F2D]/20 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#C9A87C] focus:ring-4 focus:ring-[#C9A87C]/20 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#0B1F2D]/50 mb-2 uppercase tracking-wider">Longitud</label>
              <input
                type="number" value={longitude} onChange={(e) => setLongitude(e.target.value)}
                placeholder="-71.9832"
                className="w-full border border-[#0B1F2D]/20 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#C9A87C] focus:ring-4 focus:ring-[#C9A87C]/20 transition-all"
              />
            </div>
          </div>

          {/* Precio y camas */}
          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#0B1F2D]/50 mb-2 uppercase tracking-wider">Precio/noche (USD) *</label>
              <input
                type="number" value={price} onChange={(e) => setPrice(e.target.value)}
                placeholder="150"
                className="w-full border border-[#0B1F2D]/20 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#C9A87C] focus:ring-4 focus:ring-[#C9A87C]/20 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#0B1F2D]/50 mb-2 uppercase tracking-wider">Cama extra (USD)</label>
              <input
                type="number" value={extraBedPrice} onChange={(e) => setExtraBedPrice(e.target.value)}
                className="w-full border border-[#0B1F2D]/20 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#C9A87C] focus:ring-4 focus:ring-[#C9A87C]/20 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#0B1F2D]/50 mb-2 uppercase tracking-wider">Total habitaciones</label>
              <input
                type="number" value={totalRooms}
                onChange={(e) => setTotalRooms(e.target.value)}
                className="w-full border border-[#0B1F2D]/20 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#C9A87C] focus:ring-4 focus:ring-[#C9A87C]/20 transition-all"
              />
            </div>
          </div>

          {/* Estrellas y tipo */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#0B1F2D]/50 mb-2 uppercase tracking-wider">Estrellas</label>
              <select
                value={stars} onChange={(e) => setStars(e.target.value)}
                className="w-full border border-[#0B1F2D]/20 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#C9A87C] focus:ring-4 focus:ring-[#C9A87C]/20 transition-all bg-white"
              >
                {[3, 4, 5].map((n) => <option key={n} value={n}>{n} estrellas</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-[#0B1F2D]/50 mb-2 uppercase tracking-wider">Tipo de experiencia</label>
              <select
                value={experienceType} onChange={(e) => setExperienceType(e.target.value)}
                className="w-full border border-[#0B1F2D]/20 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#C9A87C] focus:ring-4 focus:ring-[#C9A87C]/20 transition-all bg-white"
              >
                {EXPERIENCE_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
          </div>

          {/* Imágenes */}
          <div>
            <label className="block text-xs font-bold text-[#0B1F2D]/50 mb-2 uppercase tracking-wider">URLs de imágenes (una por línea)</label>
            <textarea
              value={images} onChange={(e) => setImages(e.target.value)}
              rows={3} placeholder={"https://ejemplo.com/imagen1.jpg\nhttps://ejemplo.com/imagen2.jpg"}
              className="w-full border border-[#0B1F2D]/20 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#C9A87C] focus:ring-4 focus:ring-[#C9A87C]/20 transition-all resize-none font-mono"
            />
          </div>

          {/* Servicios */}
          <div>
            <label className="block text-xs font-bold text-[#0B1F2D]/50 mb-2 uppercase tracking-wider">Servicios (separados por coma)</label>
            <input
              value={services} onChange={(e) => setServices(e.target.value)}
              placeholder="WiFi, Piscina, Estacionamiento, Desayuno"
              className="w-full border border-[#0B1F2D]/20 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#C9A87C] focus:ring-4 focus:ring-[#C9A87C]/20 transition-all"
            />
          </div>

          {/* Características exclusivas */}
          <div>
            <label className="block text-xs font-bold text-[#0B1F2D]/50 mb-2 uppercase tracking-wider">Características exclusivas (separadas por coma)</label>
            <input
              value={exclusiveFeatures} onChange={(e) => setExclusiveFeatures(e.target.value)}
              placeholder="Vista al volcán, Arquitectura patrimonial, Chef privado"
              className="w-full border border-[#0B1F2D]/20 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#C9A87C] focus:ring-4 focus:ring-[#C9A87C]/20 transition-all"
            />
          </div>

          {error && (
            <div className="bg-rose-50 border border-rose-100 rounded-xl px-4 py-3">
              <p className="text-xs text-rose-600 font-medium">{error}</p>
            </div>
          )}

          <div className="flex justify-between items-center pt-2 border-t border-[#0B1F2D]/10">
            <button onClick={() => setMode("choose")} className="text-sm text-[#0B1F2D]/50 hover:text-[#0B1F2D] transition-colors">
              ← Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting || !name || !description || !location || !price}
              className="bg-[#C9A87C] hover:bg-[#C9A87C]/80 disabled:bg-[#0B1F2D]/20 text-white text-sm font-bold px-8 py-3 rounded-xl transition-colors shadow-lg shadow-[#C9A87C]/30 disabled:shadow-none disabled:cursor-not-allowed"
            >
              {submitting ? "Creando hotel..." : "Crear hotel ✓"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}