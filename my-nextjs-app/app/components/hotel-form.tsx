"use client";
// Componente compartido para crear/editar hotel

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

const EXPERIENCE_OPTIONS = [
  { value: "RELAX",       label: "Relax",       icon: "🌊" },
  { value: "WELLNESS",    label: "Wellness",    icon: "🧘" },
  { value: "GASTRONOMIC", label: "Gastronomic", icon: "🍷" },
  { value: "ADVENTURE",   label: "Adventure",   icon: "🏔️" },
  { value: "ROMANTIC",    label: "Romantic",    icon: "🌹" },
  { value: "CULTURAL",    label: "Cultural",    icon: "🎨" },
];

const COMMON_SERVICES = [
  "Spa", "Rooftop", "Pool", "Chef Table",
  "Airport Transfer", "Pet Friendly", "Yoga", "Winery",
  "Gym", "WiFi", "Breakfast", "Parking",
];

type HotelData = {
  name: string;
  description: string;
  location: string;
  experienceType: string;
  price: number | string;
  extraBedPrice: number | string;
  stars: number;
  services: string[];
  exclusiveFeatures: string[];
  images: string[];
};

interface HotelFormProps {
  initialData?: Partial<HotelData>;
  hotelId?: string;
  mode: "create" | "edit";
}

export default function HotelForm({ initialData, hotelId, mode }: HotelFormProps) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName]               = useState(initialData?.name ?? "");
  const [description, setDescription] = useState(initialData?.description ?? "");
  const [location, setLocation]       = useState(initialData?.location ?? "");
  const [experienceType, setExperienceType] = useState(initialData?.experienceType ?? "RELAX");
  const [price, setPrice]             = useState(initialData?.price?.toString() ?? "");
  const [extraBedPrice, setExtraBedPrice] = useState(initialData?.extraBedPrice?.toString() ?? "50");
  const [stars, setStars]             = useState(initialData?.stars ?? 5);
  const [services, setServices]       = useState<string[]>(initialData?.services ?? []);
  const [features, setFeatures]       = useState<string[]>(initialData?.exclusiveFeatures ?? []);
  const [images, setImages]           = useState<string[]>(initialData?.images ?? []);

  const [imageUrl, setImageUrl]       = useState("");
  const [newFeature, setNewFeature]   = useState("");
  const [newService, setNewService]   = useState("");

  const [submitting, setSubmitting]   = useState(false);
  const [uploading, setUploading]     = useState(false);
  const [error, setError]             = useState("");

  // ── Servicios ────────────────────────────────────────────────
  function toggleService(service: string) {
    setServices((prev) =>
      prev.includes(service) ? prev.filter((s) => s !== service) : [...prev, service]
    );
  }

  function addCustomService() {
    if (newService.trim() && !services.includes(newService.trim())) {
      setServices([...services, newService.trim()]);
      setNewService("");
    }
  }

  // ── Características ──────────────────────────────────────────
  function addFeature() {
    if (newFeature.trim() && !features.includes(newFeature.trim())) {
      setFeatures([...features, newFeature.trim()]);
      setNewFeature("");
    }
  }

  function removeFeature(f: string) {
    setFeatures(features.filter((x) => x !== f));
  }

  // ── Imágenes ─────────────────────────────────────────────────
  function addImageUrl() {
    if (imageUrl.trim() && !images.includes(imageUrl.trim())) {
      setImages([...images, imageUrl.trim()]);
      setImageUrl("");
    }
  }

  function removeImage(i: number) {
    setImages(images.filter((_, idx) => idx !== i));
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true); setError("");

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/upload", { method: "POST", body: formData });
    const data = await res.json();
    setUploading(false);

    if (!res.ok) {
      setError(data.error || "Error al subir imagen");
      return;
    }

    setImages([...images, data.url]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  // ── Submit ───────────────────────────────────────────────────
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true); setError("");

    if (!name || !description || !location || !price) {
      setError("Completa todos los campos obligatorios");
      setSubmitting(false);
      return;
    }

    const url = mode === "create" ? "/api/admin/hotels" : `/api/admin/hotels/${hotelId}`;
    const method = mode === "create" ? "POST" : "PATCH";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name, description, location, experienceType,
        price: Number(price),
        extraBedPrice: Number(extraBedPrice),
        stars,
        services, exclusiveFeatures: features, images,
      }),
    });

    setSubmitting(false);
    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Error al guardar");
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">

      {/* ── Información básica ────────────────────────────────── */}
      <section className="bg-white rounded-2xl border border-stone-100 p-6 space-y-5">
        <div>
          <h2 className="text-lg font-black text-slate-900">Información básica</h2>
          <p className="text-xs text-stone-500 mt-0.5">Datos principales del hotel</p>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wider">Nombre del hotel *</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} required
            placeholder="Ej: Hotel Antumalal"
            className="w-full bg-white border border-stone-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-teal-400 focus:ring-4 focus:ring-teal-100 transition-all" />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wider">Ubicación *</label>
            <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} required
              placeholder="Ej: Pucón, La Araucanía"
              className="w-full bg-white border border-stone-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-teal-400 focus:ring-4 focus:ring-teal-100 transition-all" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wider">Estrellas</label>
            <select value={stars} onChange={(e) => setStars(Number(e.target.value))}
              className="w-full bg-white border border-stone-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-teal-400 focus:ring-4 focus:ring-teal-100 transition-all">
              {[1, 2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>{"★".repeat(n)} ({n})</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wider">Descripción *</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} required rows={4}
            placeholder="Describe tu hotel: historia, estilo, ubicación, qué lo hace especial..."
            className="w-full bg-white border border-stone-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-teal-400 focus:ring-4 focus:ring-teal-100 transition-all resize-none" />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wider">Tipo de experiencia</label>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
            {EXPERIENCE_OPTIONS.map((opt) => (
              <button key={opt.value} type="button" onClick={() => setExperienceType(opt.value)}
                className={`p-3 rounded-xl border-2 text-center transition-all ${
                  experienceType === opt.value
                    ? "border-teal-400 bg-teal-50"
                    : "border-stone-200 hover:border-stone-300"
                }`}>
                <span className="text-xl block mb-1">{opt.icon}</span>
                <span className="text-xs font-bold text-slate-700">{opt.label}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Precios ──────────────────────────────────────────────── */}
      <section className="bg-white rounded-2xl border border-stone-100 p-6 space-y-5">
        <div>
          <h2 className="text-lg font-black text-slate-900">Precios</h2>
          <p className="text-xs text-stone-500 mt-0.5">Precio base por habitación + costo por cama extra</p>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wider">Precio base por noche * (USD)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400">$</span>
              <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} required min="0" step="0.01"
                placeholder="200"
                className="w-full bg-white border border-stone-200 rounded-xl pl-8 pr-4 py-3 text-sm outline-none focus:border-teal-400 focus:ring-4 focus:ring-teal-100 transition-all" />
            </div>
            <p className="text-xs text-stone-400 mt-1">Para habitación con cama matrimonial (1-2 personas)</p>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wider">Cama extra (USD)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400">$</span>
              <input type="number" value={extraBedPrice} onChange={(e) => setExtraBedPrice(e.target.value)} min="0" step="0.01"
                placeholder="50"
                className="w-full bg-white border border-stone-200 rounded-xl pl-8 pr-4 py-3 text-sm outline-none focus:border-teal-400 focus:ring-4 focus:ring-teal-100 transition-all" />
            </div>
            <p className="text-xs text-stone-400 mt-1">Por cama adicional (3ra y 4ta persona)</p>
          </div>
        </div>
      </section>

      {/* ── Servicios ────────────────────────────────────────────── */}
      <section className="bg-white rounded-2xl border border-stone-100 p-6 space-y-5">
        <div>
          <h2 className="text-lg font-black text-slate-900">Servicios</h2>
          <p className="text-xs text-stone-500 mt-0.5">Selecciona los servicios incluidos</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {COMMON_SERVICES.map((s) => {
            const active = services.includes(s);
            return (
              <button key={s} type="button" onClick={() => toggleService(s)}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
                  active
                    ? "bg-teal-600 text-white"
                    : "bg-stone-100 text-stone-600 hover:bg-stone-200"
                }`}>
                {active && "✓ "}{s}
              </button>
            );
          })}
        </div>

        <div className="flex gap-2">
          <input type="text" value={newService}
            onChange={(e) => setNewService(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCustomService(); } }}
            placeholder="Servicio personalizado..."
            className="flex-1 bg-white border border-stone-200 rounded-xl px-4 py-2 text-sm outline-none focus:border-teal-400" />
          <button type="button" onClick={addCustomService}
            className="bg-slate-900 hover:bg-teal-600 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors">
            Agregar
          </button>
        </div>

        {services.filter((s) => !COMMON_SERVICES.includes(s)).length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2 border-t border-stone-100">
            {services.filter((s) => !COMMON_SERVICES.includes(s)).map((s) => (
              <span key={s} className="bg-teal-100 text-teal-700 text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1">
                {s}
                <button type="button" onClick={() => toggleService(s)} className="hover:text-teal-900">×</button>
              </span>
            ))}
          </div>
        )}
      </section>

      {/* ── Características exclusivas ───────────────────────────── */}
      <section className="bg-white rounded-2xl border border-stone-100 p-6 space-y-5">
        <div>
          <h2 className="text-lg font-black text-slate-900">Características exclusivas</h2>
          <p className="text-xs text-stone-500 mt-0.5">Qué hace único a tu hotel</p>
        </div>

        <div className="flex gap-2">
          <input type="text" value={newFeature} onChange={(e) => setNewFeature(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addFeature(); } }}
            placeholder="Ej: Vista al volcán, jardines históricos..."
            className="flex-1 bg-white border border-stone-200 rounded-xl px-4 py-2 text-sm outline-none focus:border-teal-400" />
          <button type="button" onClick={addFeature}
            className="bg-slate-900 hover:bg-teal-600 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors">
            Agregar
          </button>
        </div>

        {features.length > 0 && (
          <div className="space-y-2">
            {features.map((f) => (
              <div key={f} className="flex items-center gap-2 bg-stone-50 rounded-xl px-4 py-2">
                <span className="text-teal-600">★</span>
                <span className="flex-1 text-sm text-slate-700">{f}</span>
                <button type="button" onClick={() => removeFeature(f)}
                  className="text-rose-500 hover:text-rose-600 text-xs font-bold">Quitar</button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── Imágenes ─────────────────────────────────────────────── */}
      <section className="bg-white rounded-2xl border border-stone-100 p-6 space-y-5">
        <div>
          <h2 className="text-lg font-black text-slate-900">Imágenes</h2>
          <p className="text-xs text-stone-500 mt-0.5">Sube fotos o pega URLs (la primera será la principal)</p>
        </div>

        {/* Subir archivo */}
        <div>
          <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wider">Subir desde tu computador</label>
          <div className="flex gap-2">
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload}
              className="flex-1 text-sm text-stone-600 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-slate-900 file:text-white hover:file:bg-teal-600 file:cursor-pointer cursor-pointer" />
            {uploading && <span className="text-xs text-teal-600 self-center">Subiendo...</span>}
          </div>
          <p className="text-xs text-stone-400 mt-1">JPG, PNG o WEBP — máx 5MB</p>
        </div>

        {/* O por URL */}
        <div>
          <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wider">O pega una URL</label>
          <div className="flex gap-2">
            <input type="url" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addImageUrl(); } }}
              placeholder="https://images.unsplash.com/..."
              className="flex-1 bg-white border border-stone-200 rounded-xl px-4 py-2 text-sm outline-none focus:border-teal-400" />
            <button type="button" onClick={addImageUrl}
              className="bg-slate-900 hover:bg-teal-600 text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors">
              Agregar
            </button>
          </div>
        </div>

        {/* Galería */}
        {images.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 pt-3 border-t border-stone-100">
            {images.map((img, i) => (
              <div key={i} className="relative aspect-square rounded-xl overflow-hidden bg-stone-100 group">
                <img src={img} alt={`Foto ${i + 1}`} className="w-full h-full object-cover" />
                {i === 0 && (
                  <span className="absolute top-2 left-2 bg-teal-600 text-white text-xs font-bold px-2 py-1 rounded-full">Principal</span>
                )}
                <button type="button" onClick={() => removeImage(i)}
                  className="absolute top-2 right-2 w-7 h-7 bg-white/90 hover:bg-rose-500 hover:text-white rounded-full text-sm font-bold transition-colors opacity-0 group-hover:opacity-100">
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {error && (
        <div className="bg-rose-50 border border-rose-100 rounded-xl px-4 py-3">
          <p className="text-sm text-rose-600 font-medium">{error}</p>
        </div>
      )}

      <div className="flex gap-3 justify-end">
        <button type="button" onClick={() => router.push("/admin")}
          className="px-6 py-3 text-sm text-stone-600 hover:text-slate-900 font-semibold transition-colors">
          Cancelar
        </button>
        <button type="submit" disabled={submitting}
          className="bg-teal-600 hover:bg-teal-700 disabled:bg-stone-300 text-white text-sm font-bold px-8 py-3 rounded-xl transition-colors shadow-lg shadow-teal-200 disabled:shadow-none disabled:cursor-not-allowed">
          {submitting ? "Guardando..." : mode === "create" ? "Publicar hotel ✓" : "Guardar cambios ✓"}
        </button>
      </div>
    </form>
  );
}
