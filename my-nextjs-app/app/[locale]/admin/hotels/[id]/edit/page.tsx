"use client";
// app/[locale]/admin/hotels/[id]/edit/page.tsx

import { Link, useRouter } from "@/i18n/navigation";
import { useParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";

const EXPERIENCE_TYPES = [
  { value: "RELAX",       label: "Relax" },
  { value: "WELLNESS",    label: "Wellness" },
  { value: "GASTRONOMIC", label: "Gastronómico" },
  { value: "ADVENTURE",   label: "Aventura" },
  { value: "ROMANTIC",    label: "Romántico" },
  { value: "CULTURAL",    label: "Cultural" },
];

const ROOM_NAMES = ["Estándar", "Matrimonial", "Familiar", "Premium", "Presidencial"];

type RoomType = {
  id: string;
  name: string;
  capacity: number;
  count: number;
  pricePerNight: number;
  maxExtraBeds: number;
  extraBedPrice: number;
};

function mkRoom(): RoomType {
  return {
    id: crypto.randomUUID(),
    name: "Estándar",
    capacity: 2,
    count: 1,
    pricePerNight: 0,
    maxExtraBeds: 1,
    extraBedPrice: 50,
  };
}

const F  = "w-full border border-[#0B1F2D]/20 rounded-xl px-3 py-2.5 text-sm outline-none focus:border-[#C9A87C] focus:ring-4 focus:ring-[#C9A87C]/15 transition-all bg-white";
const FL = "w-full border border-[#0B1F2D]/20 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#C9A87C] focus:ring-4 focus:ring-[#C9A87C]/15 transition-all bg-white";

export default function EditHotelPage() {
  const router  = useRouter();
  const params  = useParams<{ id: string }>();
  const hotelId = params.id;

  const [loading, setLoading]       = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]           = useState("");

  // Campos del formulario
  const [name, setName]                           = useState("");
  const [description, setDescription]             = useState("");
  const [location, setLocation]                   = useState("");
  const [address, setAddress]                     = useState("");
  const [latitude, setLatitude]                   = useState("");
  const [longitude, setLongitude]                 = useState("");
  const [price, setPrice]                         = useState("");
  const [extraBedPrice, setExtraBedPrice]         = useState("50");
  const [stars, setStars]                         = useState("5");
  const [totalRooms, setTotalRooms]               = useState("10");
  const [experienceType, setExperienceType]       = useState("RELAX");
  const [services, setServices]                   = useState("");
  const [exclusiveFeatures, setExclusiveFeatures] = useState("");

  // Imágenes
  const [imageList, setImageList] = useState<string[]>([]);
  const [imageTab, setImageTab]   = useState<"url" | "file">("url");
  const [urlInput, setUrlInput]   = useState("");
  const fileRef                   = useRef<HTMLInputElement>(null);

  // Tipos de habitación
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);

  // ── Carga inicial ─────────────────────────────────────────
  useEffect(() => {
    async function load() {
      try {
        const res  = await fetch(`/api/admin/hotels/${hotelId}`);
        const data = await res.json();

        if (!res.ok) {
          setError(data.error || "Error al cargar el hotel");
          setLoading(false);
          return;
        }

        setName(data.name ?? "");
        setDescription(data.description ?? "");
        setLocation(data.location ?? "");
        setAddress(data.address ?? "");
        setLatitude(data.latitude != null ? String(data.latitude) : "");
        setLongitude(data.longitude != null ? String(data.longitude) : "");
        setPrice(data.price != null ? String(data.price) : "");
        setExtraBedPrice(data.extraBedPrice != null ? String(data.extraBedPrice) : "50");
        setStars(data.stars != null ? String(data.stars) : "5");
        setTotalRooms(data.totalRooms != null ? String(data.totalRooms) : "10");
        setExperienceType(data.experienceType ?? "RELAX");
        setServices(Array.isArray(data.services) ? data.services.join(", ") : (data.services ?? ""));
        setExclusiveFeatures(Array.isArray(data.exclusiveFeatures) ? data.exclusiveFeatures.join(", ") : (data.exclusiveFeatures ?? ""));
        setImageList(Array.isArray(data.images) ? data.images : []);
        if (Array.isArray(data.roomTypes) && data.roomTypes.length > 0) {
          setRoomTypes(data.roomTypes.map((r: RoomType) => ({ ...r, id: r.id ?? crypto.randomUUID() })));
        }
      } catch {
        setError("Error de red al cargar el hotel");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [hotelId]);

  // ── helpers: imágenes ─────────────────────────────────────
  function addUrls() {
    const urls = urlInput.split("\n").map((s) => s.trim()).filter(Boolean);
    if (!urls.length) return;
    setImageList((prev) => {
      const next = [...prev];
      urls.forEach((u) => { if (!next.includes(u)) next.push(u); });
      return next;
    });
    setUrlInput("");
  }

  function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    Array.from(e.target.files ?? []).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const b64 = ev.target?.result as string;
        if (b64) setImageList((prev) => [...prev, b64]);
      };
      reader.readAsDataURL(file);
    });
    if (fileRef.current) fileRef.current.value = "";
  }

  function removeImage(idx: number) {
    setImageList((prev) => prev.filter((_, i) => i !== idx));
  }

  // ── helpers: room types ───────────────────────────────────
  function addRoom()  { setRoomTypes((prev) => [...prev, mkRoom()]); }
  function removeRoom(id: string) { setRoomTypes((prev) => prev.filter((r) => r.id !== id)); }
  function patchRoom(id: string, patch: Partial<Omit<RoomType, "id">>) {
    setRoomTypes((prev) => prev.map((r) => r.id === id ? { ...r, ...patch } : r));
  }

  // ── Guardar ───────────────────────────────────────────────
  async function handleSubmit() {
    setSubmitting(true);
    setError("");

    const pendingUrls = urlInput.split("\n").map((s) => s.trim()).filter(Boolean);
    const finalImages = [
      ...imageList,
      ...pendingUrls.filter((u) => !imageList.includes(u)),
    ];

    const res = await fetch(`/api/admin/hotels/${hotelId}`, {
      method: "PATCH",
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
        images:            finalImages,
        services:          services.split(",").map((s) => s.trim()).filter(Boolean),
        exclusiveFeatures: exclusiveFeatures.split(",").map((s) => s.trim()).filter(Boolean),
        roomTypes,
      }),
    });

    const data = await res.json();
    setSubmitting(false);

    if (!res.ok) {
      setError(data.error || "Error al actualizar el hotel");
      return;
    }

    router.push("/admin/hotels");
  }

  // ── Loading state ─────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF6F0] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-[#C9A87C] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm text-[#0B1F2D]/50">Cargando hotel...</p>
        </div>
      </div>
    );
  }

  // ── Formulario ────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#FAF6F0]">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 space-y-6">
        <div>
          <Link href="/admin/hotels" className="text-sm text-[#C9A87C] font-bold mb-6 inline-block">
            ← Volver a mis hoteles
          </Link>
          <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-[#C9A87C] mb-1">Editar hotel</p>
          <h1 className="font-display text-3xl font-bold text-[#0B1F2D]">{name || "Hotel"}</h1>
        </div>

        <div className="bg-white rounded-2xl border border-[#0B1F2D]/10 p-8 shadow-sm space-y-6">

          {/* Nombre */}
          <div>
            <label className="block text-xs font-bold text-[#0B1F2D]/50 mb-2 uppercase tracking-wider">Nombre del hotel *</label>
            <input
              value={name} onChange={(e) => setName(e.target.value)}
              placeholder="Ej: Hotel Boutique Las Piedras"
              className={FL}
            />
          </div>

          {/* Descripción */}
          <div>
            <label className="block text-xs font-bold text-[#0B1F2D]/50 mb-2 uppercase tracking-wider">Descripción *</label>
            <textarea
              value={description} onChange={(e) => setDescription(e.target.value)}
              rows={4} placeholder="Describe la experiencia única del hotel..."
              className={`${FL} resize-none`}
            />
          </div>

          {/* Ubicación */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#0B1F2D]/50 mb-2 uppercase tracking-wider">Ciudad / Región *</label>
              <input value={location} onChange={(e) => setLocation(e.target.value)} placeholder="Ej: Pucón, Araucanía" className={FL} />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#0B1F2D]/50 mb-2 uppercase tracking-wider">Dirección</label>
              <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Ej: Camino Villarrica km 15" className={FL} />
            </div>
          </div>

          {/* Coordenadas */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#0B1F2D]/50 mb-2 uppercase tracking-wider">Latitud</label>
              <input type="number" value={latitude} onChange={(e) => setLatitude(e.target.value)} placeholder="-39.2811" className={FL} />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#0B1F2D]/50 mb-2 uppercase tracking-wider">Longitud</label>
              <input type="number" value={longitude} onChange={(e) => setLongitude(e.target.value)} placeholder="-71.9832" className={FL} />
            </div>
          </div>

          {/* Precio y camas */}
          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#0B1F2D]/50 mb-2 uppercase tracking-wider">Precio base/noche (USD) *</label>
              <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="150" className={FL} />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#0B1F2D]/50 mb-2 uppercase tracking-wider">Cama extra (USD)</label>
              <input type="number" value={extraBedPrice} onChange={(e) => setExtraBedPrice(e.target.value)} className={FL} />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#0B1F2D]/50 mb-2 uppercase tracking-wider">Total habitaciones</label>
              <input type="number" value={totalRooms} onChange={(e) => setTotalRooms(e.target.value)} className={FL} />
            </div>
          </div>

          {/* Estrellas y tipo */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#0B1F2D]/50 mb-2 uppercase tracking-wider">Estrellas</label>
              <select value={stars} onChange={(e) => setStars(e.target.value)} className={FL}>
                {[3, 4, 5].map((n) => <option key={n} value={n}>{n} estrellas</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-[#0B1F2D]/50 mb-2 uppercase tracking-wider">Tipo de experiencia</label>
              <select value={experienceType} onChange={(e) => setExperienceType(e.target.value)} className={FL}>
                {EXPERIENCE_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
          </div>

          {/* ── Tipos de habitación ──────────────────────────────── */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-xs font-bold text-[#0B1F2D]/50 uppercase tracking-wider">Tipos de habitación</label>
              <button
                type="button"
                onClick={addRoom}
                className="flex items-center gap-1.5 text-xs font-bold text-[#C9A87C] border border-[#C9A87C]/40 hover:bg-[#C9A87C]/8 px-3 py-1.5 rounded-lg transition-colors"
              >
                + Agregar tipo de habitación
              </button>
            </div>

            {roomTypes.length === 0 && (
              <p className="text-xs text-[#0B1F2D]/35 italic border border-dashed border-[#0B1F2D]/15 rounded-xl px-4 py-5 text-center">
                Sin tipos de habitación. Haz clic en &quot;+ Agregar&quot; para añadir uno.
              </p>
            )}

            <div className="space-y-3">
              {roomTypes.map((room) => (
                <div key={room.id} className="border border-[#0B1F2D]/12 rounded-xl p-4 bg-[#FAF6F0]">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-[#0B1F2D]/60 uppercase tracking-wider">Tipo de pieza</span>
                    <button
                      type="button"
                      onClick={() => removeRoom(room.id)}
                      className="text-[#0B1F2D]/30 hover:text-rose-500 transition-colors text-lg leading-none"
                      aria-label="Eliminar tipo"
                    >
                      ×
                    </button>
                  </div>

                  <div className="mb-3">
                    <label className="block text-[10px] font-semibold text-[#0B1F2D]/40 mb-1 uppercase tracking-wider">Nombre</label>
                    <select
                      value={ROOM_NAMES.includes(room.name) ? room.name : "__custom__"}
                      onChange={(e) => {
                        if (e.target.value !== "__custom__") patchRoom(room.id, { name: e.target.value });
                      }}
                      className={F}
                    >
                      {ROOM_NAMES.map((n) => <option key={n} value={n}>{n}</option>)}
                      {!ROOM_NAMES.includes(room.name) && <option value="__custom__">{room.name}</option>}
                    </select>
                  </div>

                  <div className="grid grid-cols-3 gap-3 mb-3">
                    <div>
                      <label className="block text-[10px] font-semibold text-[#0B1F2D]/40 mb-1 uppercase tracking-wider">Capacidad (personas)</label>
                      <input
                        type="number" min={1} max={10}
                        value={room.capacity}
                        onChange={(e) => patchRoom(room.id, { capacity: parseInt(e.target.value) || 1 })}
                        className={F}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-[#0B1F2D]/40 mb-1 uppercase tracking-wider">Cantidad</label>
                      <input
                        type="number" min={1}
                        value={room.count}
                        onChange={(e) => patchRoom(room.id, { count: parseInt(e.target.value) || 1 })}
                        className={F}
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-[#0B1F2D]/40 mb-1 uppercase tracking-wider">Precio/noche (USD)</label>
                      <input
                        type="number" min={0}
                        value={room.pricePerNight}
                        onChange={(e) => patchRoom(room.id, { pricePerNight: parseFloat(e.target.value) || 0 })}
                        className={F}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] font-semibold text-[#0B1F2D]/40 mb-1 uppercase tracking-wider">Máx. camas extra</label>
                      <select
                        value={room.maxExtraBeds}
                        onChange={(e) => patchRoom(room.id, { maxExtraBeds: parseInt(e.target.value) })}
                        className={F}
                      >
                        <option value={0}>0 — Sin camas extra</option>
                        <option value={1}>1 cama extra</option>
                        <option value={2}>2 camas extra</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold text-[#0B1F2D]/40 mb-1 uppercase tracking-wider">Precio cama extra (USD)</label>
                      <input
                        type="number" min={0}
                        value={room.extraBedPrice}
                        onChange={(e) => patchRoom(room.id, { extraBedPrice: parseFloat(e.target.value) || 0 })}
                        className={F}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Imágenes (dual tab) ──────────────────────────────── */}
          <div>
            <label className="block text-xs font-bold text-[#0B1F2D]/50 mb-3 uppercase tracking-wider">Imágenes</label>

            <div className="flex border border-[#0B1F2D]/15 rounded-xl overflow-hidden mb-4 w-fit">
              {(["url", "file"] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setImageTab(tab)}
                  className={`px-5 py-2 text-xs font-bold transition-colors ${
                    imageTab === tab
                      ? "bg-[#0B1F2D] text-white"
                      : "bg-white text-[#0B1F2D]/50 hover:text-[#0B1F2D]"
                  }`}
                >
                  {tab === "url" ? "Desde URL" : "Subir archivo"}
                </button>
              ))}
            </div>

            {imageTab === "url" && (
              <div className="space-y-2">
                <textarea
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  rows={3}
                  placeholder={"https://ejemplo.com/imagen1.jpg\nhttps://ejemplo.com/imagen2.jpg"}
                  className={`${FL} resize-none font-mono`}
                />
                <button
                  type="button"
                  onClick={addUrls}
                  disabled={!urlInput.trim()}
                  className="text-xs font-bold text-white bg-[#0B1F2D] hover:bg-[#0B1F2D]/80 disabled:bg-[#0B1F2D]/20 disabled:cursor-not-allowed px-4 py-2 rounded-lg transition-colors"
                >
                  Agregar URLs
                </button>
              </div>
            )}

            {imageTab === "file" && (
              <div>
                <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-[#0B1F2D]/20 hover:border-[#C9A87C]/60 rounded-xl px-4 py-8 cursor-pointer transition-colors bg-[#FAF6F0] hover:bg-[#C9A87C]/5">
                  <span className="text-2xl">📎</span>
                  <span className="text-sm font-semibold text-[#0B1F2D]/60">Haz clic para seleccionar imágenes</span>
                  <span className="text-xs text-[#0B1F2D]/35">PNG, JPG, JPEG, WEBP</span>
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/png,image/jpg,image/jpeg,image/webp"
                    multiple
                    className="hidden"
                    onChange={handleFiles}
                  />
                </label>
              </div>
            )}

            {imageList.length > 0 && (
              <div className="mt-4">
                <p className="text-[10px] font-bold text-[#0B1F2D]/40 uppercase tracking-wider mb-2">
                  {imageList.length} imagen{imageList.length !== 1 ? "es" : ""} agregada{imageList.length !== 1 ? "s" : ""}
                </p>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {imageList.map((src, idx) => (
                    <div key={idx} className="relative group aspect-square rounded-lg overflow-hidden border border-[#0B1F2D]/12">
                      <img src={src} alt={`Imagen ${idx + 1}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeImage(idx)}
                        className="absolute top-1 right-1 bg-[#0B1F2D]/70 hover:bg-rose-600 text-white rounded-full w-5 h-5 text-xs font-bold leading-none flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        aria-label="Eliminar imagen"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Servicios */}
          <div>
            <label className="block text-xs font-bold text-[#0B1F2D]/50 mb-2 uppercase tracking-wider">Servicios (separados por coma)</label>
            <input
              value={services} onChange={(e) => setServices(e.target.value)}
              placeholder="WiFi, Piscina, Estacionamiento, Desayuno"
              className={FL}
            />
          </div>

          {/* Características exclusivas */}
          <div>
            <label className="block text-xs font-bold text-[#0B1F2D]/50 mb-2 uppercase tracking-wider">Características exclusivas (separadas por coma)</label>
            <input
              value={exclusiveFeatures} onChange={(e) => setExclusiveFeatures(e.target.value)}
              placeholder="Vista al volcán, Arquitectura patrimonial, Chef privado"
              className={FL}
            />
          </div>

          {error && (
            <div className="bg-rose-50 border border-rose-100 rounded-xl px-4 py-3">
              <p className="text-xs text-rose-600 font-medium">{error}</p>
            </div>
          )}

          <div className="flex justify-between items-center pt-2 border-t border-[#0B1F2D]/10">
            <Link href="/admin/hotels" className="text-sm text-[#0B1F2D]/50 hover:text-[#0B1F2D] transition-colors">
              ← Cancelar
            </Link>
            <button
              onClick={handleSubmit}
              disabled={submitting || !name || !description || !location || !price}
              className="bg-[#C9A87C] hover:bg-[#C9A87C]/80 disabled:bg-[#0B1F2D]/20 text-white text-sm font-bold px-8 py-3 rounded-xl transition-colors shadow-lg shadow-[#C9A87C]/30 disabled:shadow-none disabled:cursor-not-allowed"
            >
              {submitting ? "Guardando..." : "Guardar cambios ✓"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
