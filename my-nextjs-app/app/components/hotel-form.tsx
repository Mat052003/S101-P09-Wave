"use client";
// app/components/hotel-form.tsx

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

const EXPERIENCE_OPTIONS = [
  { value: "RELAX",       label: "Relax",       icon: "🌊" },
  { value: "WELLNESS",    label: "Wellness",    icon: "🧘" },
  { value: "GASTRONOMIC", label: "Gastronómico", icon: "🍷" },
  { value: "ADVENTURE",   label: "Aventura",    icon: "🏔️" },
  { value: "ROMANTIC",    label: "Romántico",   icon: "🌹" },
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
  totalRooms: number | string;
  isActive: boolean;
  stars: number;
  services: string[];
  exclusiveFeatures: string[];
  images: string[];
  latitude?: number | string;
  longitude?: number | string;
  address?: string;
};

interface HotelFormProps {
  initialData?: Partial<HotelData>;
  hotelId?: string;
  mode: "create" | "edit";
}

export default function HotelForm({ initialData, hotelId, mode }: HotelFormProps) {
  const router      = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [name, setName]                   = useState(initialData?.name ?? "");
  const [description, setDescription]     = useState(initialData?.description ?? "");
  const [location, setLocation]           = useState(initialData?.location ?? "");
  const [experienceType, setExperienceType] = useState(initialData?.experienceType ?? "RELAX");
  const [price, setPrice]                 = useState(initialData?.price?.toString() ?? "");
  const [extraBedPrice, setExtraBedPrice] = useState(initialData?.extraBedPrice?.toString() ?? "50");
  const [totalRooms, setTotalRooms]       = useState(initialData?.totalRooms?.toString() ?? "10");
  const [isActive, setIsActive]           = useState(initialData?.isActive ?? true);
  const [stars, setStars]                 = useState(initialData?.stars ?? 5);
  const [services, setServices]           = useState<string[]>(initialData?.services ?? []);
  const [features, setFeatures]           = useState<string[]>(initialData?.exclusiveFeatures ?? []);
  const [images, setImages]               = useState<string[]>(initialData?.images ?? []);
  // ── Ubicación Google Maps ─────────────────────────────────
  const [latitude, setLatitude]           = useState(initialData?.latitude?.toString() ?? "");
  const [longitude, setLongitude]         = useState(initialData?.longitude?.toString() ?? "");
  const [address, setAddress]             = useState(initialData?.address ?? "");

  const [imageUrl, setImageUrl]           = useState("");
  const [newFeature, setNewFeature]       = useState("");
  const [newService, setNewService]       = useState("");
  const [submitting, setSubmitting]       = useState(false);
  const [uploading, setUploading]         = useState(false);
  const [error, setError]                 = useState("");

  const inputClass = "w-full bg-white border-2 border-[#0B1F2D]/50 rounded-xl px-4 py-3 text-sm text-[#0B1F2D] placeholder-[#0B1F2D]/35 outline-none focus:border-[#0B1F2D] focus:ring-2 focus:ring-[#0B1F2D]/10 transition-all";
  const labelClass = "block text-[10px] font-bold uppercase tracking-[0.18em] text-[#0B1F2D] mb-1.5";
  const sectionClass = "bg-white rounded-2xl border-2 border-[#0B1F2D]/20 p-6 space-y-5 shadow-sm";

  function toggleService(service: string) {
    setServices((prev) => prev.includes(service) ? prev.filter((s) => s !== service) : [...prev, service]);
  }

  function addCustomService() {
    if (newService.trim() && !services.includes(newService.trim())) {
      setServices([...services, newService.trim()]); setNewService("");
    }
  }

  function addFeature() {
    if (newFeature.trim() && !features.includes(newFeature.trim())) {
      setFeatures([...features, newFeature.trim()]); setNewFeature("");
    }
  }

  function removeFeature(f: string) { setFeatures(features.filter((x) => x !== f)); }

  function addImageUrl() {
    if (imageUrl.trim() && !images.includes(imageUrl.trim())) {
      setImages([...images, imageUrl.trim()]); setImageUrl("");
    }
  }

  function removeImage(i: number) { setImages(images.filter((_, idx) => idx !== i)); }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true); setError("");
    const formData = new FormData();
    formData.append("file", file);
    const res  = await fetch("/api/upload", { method: "POST", body: formData });
    const data = await res.json();
    setUploading(false);
    if (!res.ok) { setError(data.error || "Error al subir imagen"); return; }
    setImages([...images, data.url]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true); setError("");

    if (!name || !description || !location || !price) {
      setError("Completa todos los campos obligatorios");
      setSubmitting(false);
      return;
    }

    const url    = mode === "create" ? "/api/admin/hotels" : `/api/admin/hotels/${hotelId}`;
    const method = mode === "create" ? "POST" : "PATCH";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name, description, location, experienceType,
        price:             Number(price),
        extraBedPrice:     Number(extraBedPrice),
        totalRooms:        Number(totalRooms),
        isActive, stars,
        services,
        exclusiveFeatures: features,
        images,
        latitude:  latitude  ? Number(latitude)  : null,
        longitude: longitude ? Number(longitude) : null,
        address:   address || null,
      }),
    });

    setSubmitting(false);
    if (!res.ok) { const data = await res.json(); setError(data.error || "Error al guardar"); return; }
    router.push("/admin");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">

      {/* ── Información básica ─────────────────────────────── */}
      <section className={sectionClass}>
        <div>
          <h2 className="font-display text-xl font-bold text-[#0B1F2D]">Información básica</h2>
          <p className="text-xs text-[#0B1F2D]/40 mt-0.5">Datos principales del hotel</p>
        </div>

        <div>
          <label className={labelClass}>Nombre del hotel *</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} required
            placeholder="Ej: Hotel Antumalal" className={inputClass} />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Ubicación *</label>
            <input type="text" value={location} onChange={(e) => setLocation(e.target.value)} required
              placeholder="Ej: Pucón, La Araucanía" className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Estrellas</label>
            <select value={stars} onChange={(e) => setStars(Number(e.target.value))} className={inputClass}>
              {[1,2,3,4,5].map((n) => <option key={n} value={n}>{"★".repeat(n)} ({n})</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className={labelClass}>Descripción *</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} required rows={4}
            placeholder="Describe tu hotel: historia, estilo, ubicación, qué lo hace especial..."
            className={`${inputClass} resize-none`} />
        </div>

        <div>
          <label className={labelClass}>Tipo de experiencia</label>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
            {EXPERIENCE_OPTIONS.map((opt) => (
              <button key={opt.value} type="button" onClick={() => setExperienceType(opt.value)}
                className={`p-3 rounded-xl border-2 text-center transition-all ${
                  experienceType === opt.value
                    ? "border-[#C9A87C] bg-[#C9A87C]/10"
                    : "border-[#0B1F2D]/10 hover:border-[#0B1F2D]/20 bg-[#FAF6F0]"
                }`}>
                <span className="text-xl block mb-1">{opt.icon}</span>
                <span className="text-xs font-bold text-[#0B1F2D]/70">{opt.label}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Precios y disponibilidad ───────────────────────── */}
      <section className={sectionClass}>
        <div>
          <h2 className="font-display text-xl font-bold text-[#0B1F2D]">Precios y disponibilidad</h2>
          <p className="text-xs text-[#0B1F2D]/40 mt-0.5">Precio base, camas extras y capacidad</p>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Precio base por noche * (USD)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#0B1F2D]/30 text-sm">$</span>
              <input type="number" value={price} onChange={(e) => setPrice(e.target.value)}
                required min="0" step="0.01" placeholder="200"
                className={`${inputClass} pl-8`} />
            </div>
            <p className="text-[10px] text-[#0B1F2D]/35 mt-1">Para habitación con cama matrimonial (1-2 personas)</p>
          </div>
          <div>
            <label className={labelClass}>Cama extra (USD)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#0B1F2D]/30 text-sm">$</span>
              <input type="number" value={extraBedPrice} onChange={(e) => setExtraBedPrice(e.target.value)}
                min="0" step="0.01" placeholder="50"
                className={`${inputClass} pl-8`} />
            </div>
            <p className="text-[10px] text-[#0B1F2D]/35 mt-1">Por cama adicional (3ra y 4ta persona)</p>
          </div>
        </div>

        <div>
          <label className={labelClass}>Total de habitaciones</label>
          <input
            type="number"
            value={totalRooms}
            onChange={(e) => setTotalRooms(e.target.value)}
            min="1" max="500" required
            className={inputClass}
          />
          <p className="text-[10px] text-[#0B1F2D]/35 mt-1">Capacidad máxima del hotel — controla la disponibilidad</p>
        </div>

        <div className="flex items-center justify-between bg-white rounded-xl px-4 py-4 border-2 border-[#0B1F2D]/50">
          <div>
            <p className="text-sm font-bold text-[#0B1F2D]">Hotel activo</p>
            <p className="text-xs text-[#0B1F2D]/40 mt-0.5">
              {isActive ? "Los clientes pueden ver y reservar este hotel" : "El hotel está oculto y no acepta reservas"}
            </p>
          </div>
          <button type="button" onClick={() => setIsActive(!isActive)}
            className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${isActive ? "bg-[#C9A87C]" : "bg-[#0B1F2D]/20"}`}>
            <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-300 ${isActive ? "translate-x-6" : "translate-x-0.5"}`} />
          </button>
        </div>
      </section>

      {/* ── Ubicación Google Maps ──────────────────────────── */}
      <section className={sectionClass}>
        <div>
          <h2 className="font-display text-xl font-bold text-[#0B1F2D]">Ubicación en el mapa</h2>
          <p className="text-xs text-[#0B1F2D]/40 mt-0.5">Coordenadas para mostrar el hotel en Google Maps</p>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className={labelClass}>Latitud</label>
            <input type="number" value={latitude} onChange={(e) => setLatitude(e.target.value)}
              step="any" placeholder="Ej: -33.4372"
              className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Longitud</label>
            <input type="number" value={longitude} onChange={(e) => setLongitude(e.target.value)}
              step="any" placeholder="Ej: -70.6506"
              className={inputClass} />
          </div>
        </div>

        <div>
          <label className={labelClass}>Dirección completa</label>
          <input type="text" value={address} onChange={(e) => setAddress(e.target.value)}
            placeholder="Ej: Av. El Bosque Norte 500, Providencia, Santiago"
            className={inputClass} />
          <p className="text-[10px] text-[#0B1F2D]/35 mt-1">
            Puedes obtener las coordenadas en{" "}
            <a href="https://maps.google.com" target="_blank" rel="noopener noreferrer"
              className="text-[#C9A87C] hover:underline">Google Maps</a>
            {" "}→ clic derecho → "¿Qué hay aquí?"
          </p>
        </div>
      </section>

      {/* ── Servicios ─────────────────────────────────────── */}
      <section className={sectionClass}>
        <div>
          <h2 className="font-display text-xl font-bold text-[#0B1F2D]">Servicios</h2>
          <p className="text-xs text-[#0B1F2D]/40 mt-0.5">Selecciona los servicios incluidos</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {COMMON_SERVICES.map((s) => {
            const active = services.includes(s);
            return (
              <button key={s} type="button" onClick={() => toggleService(s)}
                className={`px-4 py-2 rounded-full text-xs font-semibold transition-all border ${
                  active
                    ? "bg-[#0B1F2D] text-[#FAF6F0] border-[#0B1F2D]"
                    : "bg-[#FAF6F0] text-[#0B1F2D] border-[#0B1F2D]/12 hover:border-[#C9A87C] hover:text-[#C9A87C]"
                }`}>
                {active && "✓ "}{s}
              </button>
            );
          })}
        </div>

        <div className="flex gap-2">
          <input type="text" value={newService} onChange={(e) => setNewService(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addCustomService(); } }}
            placeholder="Servicio personalizado..." className={`${inputClass} flex-1`} />
          <button type="button" onClick={addCustomService}
            className="bg-[#0B1F2D] hover:bg-[#1B4965] text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors">
            Agregar
          </button>
        </div>

        {services.filter((s) => !COMMON_SERVICES.includes(s)).length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2 border-t border-[#0B1F2D]/8">
            {services.filter((s) => !COMMON_SERVICES.includes(s)).map((s) => (
              <span key={s} className="bg-[#C9A87C]/15 text-[#0B1F2D] text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1 border border-[#C9A87C]/30">
                {s}
                <button type="button" onClick={() => toggleService(s)} className="hover:text-rose-500">×</button>
              </span>
            ))}
          </div>
        )}
      </section>

      {/* ── Características exclusivas ────────────────────── */}
      <section className={sectionClass}>
        <div>
          <h2 className="font-display text-xl font-bold text-[#0B1F2D]">Características exclusivas</h2>
          <p className="text-xs text-[#0B1F2D]/40 mt-0.5">Qué hace único a tu hotel</p>
        </div>

        <div className="flex gap-2">
          <input type="text" value={newFeature} onChange={(e) => setNewFeature(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addFeature(); } }}
            placeholder="Ej: Vista al volcán, jardines históricos..."
            className={`${inputClass} flex-1`} />
          <button type="button" onClick={addFeature}
            className="bg-[#0B1F2D] hover:bg-[#1B4965] text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors">
            Agregar
          </button>
        </div>

        {features.length > 0 && (
          <div className="space-y-2">
            {features.map((f) => (
              <div key={f} className="flex items-center gap-2 bg-[#FAF6F0] border border-[#0B1F2D]/8 rounded-xl px-4 py-2">
                <span className="text-[#C9A87C]">★</span>
                <span className="flex-1 text-sm text-[#0B1F2D]">{f}</span>
                <button type="button" onClick={() => removeFeature(f)}
                  className="text-rose-400 hover:text-rose-600 text-xs font-bold">Quitar</button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── Imágenes ──────────────────────────────────────── */}
      <section className={sectionClass}>
        <div>
          <h2 className="font-display text-xl font-bold text-[#0B1F2D]">Imágenes</h2>
          <p className="text-xs text-[#0B1F2D]/40 mt-0.5">Sube fotos o pega URLs (la primera será la principal)</p>
        </div>

        <div>
          <label className={labelClass}>Subir desde tu computador</label>
          <div className="flex gap-2 items-center">
            <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload}
              className="flex-1 text-sm text-[#0B1F2D]/60 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-bold file:bg-[#0B1F2D] file:text-white hover:file:bg-[#1B4965] file:cursor-pointer cursor-pointer" />
            {uploading && <span className="text-xs text-[#C9A87C]">Subiendo...</span>}
          </div>
          <p className="text-[10px] text-[#0B1F2D]/35 mt-1">JPG, PNG o WEBP — máx 5MB</p>
        </div>

        <div>
          <label className={labelClass}>O pega una URL</label>
          <div className="flex gap-2">
            <input type="url" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addImageUrl(); } }}
              placeholder="https://images.unsplash.com/..."
              className={`${inputClass} flex-1`} />
            <button type="button" onClick={addImageUrl}
              className="bg-[#0B1F2D] hover:bg-[#1B4965] text-white text-xs font-bold px-4 py-2 rounded-xl transition-colors">
              Agregar
            </button>
          </div>
        </div>

        {images.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 pt-3 border-t border-[#0B1F2D]/8">
            {images.map((img, i) => (
              <div key={i} className="relative aspect-square rounded-xl overflow-hidden bg-[#EEF0EB] group">
                <img src={img} alt={`Foto ${i + 1}`} className="w-full h-full object-cover" />
                {i === 0 && (
                  <span className="absolute top-2 left-2 bg-[#C9A87C] text-[#0B1F2D] text-xs font-bold px-2 py-1 rounded-full">Principal</span>
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
        <div className="bg-rose-50 border border-rose-200 rounded-xl px-4 py-3">
          <p className="text-sm text-rose-600 font-medium">{error}</p>
        </div>
      )}

      <div className="flex gap-3 justify-end pb-10">
        <button type="button" onClick={() => router.push("/admin")}
          className="px-6 py-3 text-sm text-[#0B1F2D]/50 hover:text-[#0B1F2D] font-semibold transition-colors">
          Cancelar
        </button>
        <button type="submit" disabled={submitting}
          className="bg-[#0B1F2D] hover:bg-[#1B4965] disabled:bg-[#0B1F2D]/30 text-[#FAF6F0] text-sm font-bold px-8 py-3 rounded-2xl transition-colors shadow-lg disabled:shadow-none disabled:cursor-not-allowed">
          {submitting ? "Guardando..." : mode === "create" ? "Publicar hotel ✓" : "Guardar cambios ✓"}
        </button>
      </div>
    </form>
  );
}