"use client";
// app/hotels/[id]/reserve/page.tsx

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import AvailabilityBadge from "@/app/components/AvailabilityBadge";

// ── Tipos ────────────────────────────────────────────────────
type Hotel = {
  id: string;
  name: string;
  location: string;
  price: number;
  extraBedPrice: number;
  stars: number;
  description: string;
  images: string[];
  experienceType: string;
};

type Experience = {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: string | null;
  category: string;
  images: string[];
};

type ExtraService = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image: string | null;
  type: string;
};

// Ícono por categoría de experiencia
const EXPERIENCE_ICONS: Record<string, string> = {
  ACTIVITY:    "🏄",
  GASTRONOMY:  "🍽️",
  TOUR:        "🗺️",
  WELLNESS:    "💆",
  ADVENTURE:   "🧗",
};

// Ícono por tipo de extra
const EXTRA_ICONS: Record<string, string> = {
  BREAKFAST:  "🥐",
  SPA:        "💆",
  TOUR:       "🗺️",
  TRANSPORT:  "🚗",
};

// ── Componente ───────────────────────────────────────────────
export default function ReservePage() {
  const router  = useRouter();
  const params  = useParams();
  const hotelId = params.id as string;

  const [hotel, setHotel]           = useState<Hotel | null>(null);
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [extras, setExtras]           = useState<ExtraService[]>([]);
  const [loading, setLoading]         = useState(true);
  const [submitting, setSubmitting]   = useState(false);
  const [error, setError]             = useState("");
  const [step, setStep]               = useState<"form" | "extras" | "review" | "done">("form");

  const [availableRooms, setAvailableRooms] = useState(99);
  const [isAvailable, setIsAvailable]       = useState(true);

  const today    = new Date().toISOString().split("T")[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];

  const [checkIn, setCheckIn]   = useState(today);
  const [checkOut, setCheckOut] = useState(tomorrow);
  const [adults, setAdults]     = useState(2);
  const [children, setChildren] = useState(0);
  const guests = adults + children;

  // selectedItems guarda { id, quantity } para experiencias y extras
  const [selectedExtras, setSelectedExtras]       = useState<Record<string, number>>({});
  const [selectedExperiences, setSelectedExperiences] = useState<Record<string, number>>({});

  // ── Carga hotel + experiencias/extras ───────────────────────
  useEffect(() => {
    Promise.all([
      fetch(`/api/hotels/${hotelId}`).then((r) => r.json()),
      fetch(`/api/hotels/${hotelId}/experiences-extras`).then((r) => r.json()),
    ])
      .then(([hotelData, catalogData]) => {
        setHotel(hotelData);
        setExperiences(catalogData.experiences ?? []);
        setExtras(catalogData.extras ?? []);
        setLoading(false);
      })
      .catch(() => {
        setError("Error cargando hotel");
        setLoading(false);
      });
  }, [hotelId]);

  // ── Cálculos de precio ────────────────────────────────────
  const nights = Math.max(1, Math.ceil(
    (new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24)
  ));
  const extraBeds      = Math.max(0, guests - 2);
  const extraBedPrice  = hotel?.extraBedPrice ?? 50;
  const pricePerNight  = (hotel?.price ?? 0) + extraBeds * extraBedPrice;
  const baseTotal      = pricePerNight * nights;

  // Arrays de ítems seleccionados para el resumen y envío
  const selectedExtraItems = extras
    .filter((e) => (selectedExtras[e.id] ?? 0) > 0)
    .map((e) => ({ ...e, quantity: selectedExtras[e.id], kind: "extra" as const }));

  const selectedExperienceItems = experiences
    .filter((e) => (selectedExperiences[e.id] ?? 0) > 0)
    .map((e) => ({ ...e, quantity: selectedExperiences[e.id], kind: "experience" as const }));

  const extrasTotal = selectedExtraItems.reduce((s, e) => s + e.price * e.quantity, 0);
  const experiencesTotal = selectedExperienceItems.reduce((s, e) => s + e.price * e.quantity, 0);
  const total = baseTotal + extrasTotal + experiencesTotal;

  // ── Helpers toggle/qty ────────────────────────────────────
  function toggleExtra(id: string) {
    setSelectedExtras((prev) => ({ ...prev, [id]: (prev[id] ?? 0) > 0 ? 0 : 1 }));
  }
  function changeExtraQty(id: string, delta: number) {
    setSelectedExtras((prev) => ({ ...prev, [id]: Math.max(0, Math.min(10, (prev[id] ?? 0) + delta)) }));
  }
  function toggleExperience(id: string) {
    setSelectedExperiences((prev) => ({ ...prev, [id]: (prev[id] ?? 0) > 0 ? 0 : 1 }));
  }
  function changeExperienceQty(id: string, delta: number) {
    setSelectedExperiences((prev) => ({ ...prev, [id]: Math.max(0, Math.min(10, (prev[id] ?? 0) + delta)) }));
  }

  // ── Submit ────────────────────────────────────────────────
  async function handleSubmit() {
    setSubmitting(true);
    setError("");

    const extrasPayload = [
      ...selectedExtraItems.map((e) => ({
        extraServiceId: e.id,
        type: e.type,
        price: e.price,
        quantity: e.quantity,
        name: e.name,
      })),
      ...selectedExperienceItems.map((e) => ({
        experienceId: e.id,
        price: e.price,
        quantity: e.quantity,
        name: e.name,
      })),
    ];

    const res = await fetch("/api/reservations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        hotelId,
        checkIn,
        checkOut,
        guests,
        rooms: 1,
        extras: extrasPayload,
      }),
    });

    const data = await res.json();
    setSubmitting(false);
    if (!res.ok) { setError(data.error || "Error al crear la reserva"); return; }
    setStep("done");
    setTimeout(() => router.push("/dashboard"), 3000);
  }

  // ── Estados de carga ──────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-[#FAF6F0] flex items-center justify-center">
        <p className="text-[#0B1F2D]/40">Cargando hotel...</p>
      </div>
    );
  }

  if (!hotel) {
    return (
      <div className="min-h-screen bg-[#FAF6F0] flex items-center justify-center">
        <p className="text-[#0B1F2D]/40">Hotel no encontrado</p>
      </div>
    );
  }

  if (step === "done") {
    return (
      <div className="min-h-screen bg-[#FAF6F0] flex items-center justify-center p-6">
        <div className="text-center space-y-6 max-w-md">
          <div className="w-24 h-24 bg-[#C9A87C]/20 rounded-full flex items-center justify-center text-5xl mx-auto">✅</div>
          <div>
            <h1 className="text-3xl font-black text-[#0B1F2D]">¡Reserva creada!</h1>
            <p className="text-[#0B1F2D]/50 mt-2">Tu reserva en {hotel.name} está pendiente de confirmación.</p>
          </div>
          <Link href="/dashboard"
            className="inline-block bg-[#0B1F2D] hover:bg-[#0B1F2D]/80 text-white text-sm font-bold px-6 py-3 rounded-xl transition-colors">
            Ver mis reservas →
          </Link>
        </div>
      </div>
    );
  }

  // ── Render principal ──────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#FAF6F0]">

      {/* Stepper */}
      <div className="bg-white border-b border-[#0B1F2D]/10 py-6">
        <div className="max-w-5xl mx-auto px-8 flex items-center justify-center gap-4">
          {[
            { key: "form",   num: 1, label: "Fechas y huéspedes" },
            { key: "extras", num: 2, label: "Experiencias"       },
            { key: "review", num: 3, label: "Confirmar"          },
          ].map((s, i, arr) => (
            <div key={s.key} className="flex items-center gap-3">
              <div className={`flex items-center gap-2 ${step === s.key ? "" : "opacity-40"}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                  step === s.key ? "bg-[#0B1F2D] text-white" : "bg-[#0B1F2D]/10 text-[#0B1F2D]"
                }`}>{s.num}</div>
                <span className="text-sm font-semibold text-[#0B1F2D] hidden md:block">{s.label}</span>
              </div>
              {i < arr.length - 1 && <div className="w-8 h-px bg-[#0B1F2D]/20" />}
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-8 py-10 grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">

          {/* ── PASO 1: Fechas y huéspedes ─────────────────── */}
          {step === "form" && (
            <div className="bg-white rounded-2xl border border-[#0B1F2D]/10 p-8 shadow-sm space-y-6">
              <div>
                <p className="text-xs text-[#C9A87C] font-bold uppercase tracking-widest mb-2">Paso 1 de 3</p>
                <h2 className="text-2xl font-black text-[#0B1F2D]">Selecciona fechas y huéspedes</h2>
              </div>

              {/* Fechas */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#0B1F2D]/50 mb-2 uppercase tracking-wider">Check-in</label>
                  <input type="date" value={checkIn} min={today}
                    onChange={(e) => setCheckIn(e.target.value)}
                    className="w-full bg-white border border-[#0B1F2D]/20 rounded-xl px-4 py-3.5 text-sm outline-none focus:border-[#C9A87C] focus:ring-4 focus:ring-[#C9A87C]/20 transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#0B1F2D]/50 mb-2 uppercase tracking-wider">Check-out</label>
                  <input type="date" value={checkOut} min={checkIn}
                    onChange={(e) => setCheckOut(e.target.value)}
                    className="w-full bg-white border border-[#0B1F2D]/20 rounded-xl px-4 py-3.5 text-sm outline-none focus:border-[#C9A87C] focus:ring-4 focus:ring-[#C9A87C]/20 transition-all" />
                </div>
              </div>

              {/* Disponibilidad */}
              <AvailabilityBadge
                hotelId={hotelId}
                checkIn={checkIn}
                checkOut={checkOut}
                rooms={1}
                onAvailabilityChange={(available, rooms) => {
                  setIsAvailable(available);
                  setAvailableRooms(rooms);
                }}
              />

              {/* Adultos y niños */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#0B1F2D]/50 mb-2 uppercase tracking-wider">Adultos</label>
                  <div className="flex items-center gap-3 bg-[#FAF6F0] rounded-xl px-4 py-3">
                    <button type="button" onClick={() => setAdults(Math.max(1, adults - 1))}
                      className="w-9 h-9 rounded-full bg-white border border-[#0B1F2D]/20 hover:border-[#C9A87C] text-[#0B1F2D] font-bold transition-colors">−</button>
                    <span className="text-2xl font-black text-[#0B1F2D] min-w-[32px] text-center">{adults}</span>
                    <button type="button" onClick={() => setAdults(Math.min(4, adults + 1))}
                      className="w-9 h-9 rounded-full bg-white border border-[#0B1F2D]/20 hover:border-[#C9A87C] text-[#0B1F2D] font-bold transition-colors">+</button>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#0B1F2D]/50 mb-2 uppercase tracking-wider">Niños</label>
                  <div className="flex items-center gap-3 bg-[#FAF6F0] rounded-xl px-4 py-3">
                    <button type="button" onClick={() => setChildren(Math.max(0, children - 1))}
                      className="w-9 h-9 rounded-full bg-white border border-[#0B1F2D]/20 hover:border-[#C9A87C] text-[#0B1F2D] font-bold transition-colors">−</button>
                    <span className="text-2xl font-black text-[#0B1F2D] min-w-[32px] text-center">{children}</span>
                    <button type="button" onClick={() => setChildren(Math.min(4, children + 1))}
                      className="w-9 h-9 rounded-full bg-white border border-[#0B1F2D]/20 hover:border-[#C9A87C] text-[#0B1F2D] font-bold transition-colors">+</button>
                  </div>
                </div>
              </div>

              {guests > 2 && (
                <div className="bg-[#C9A87C]/10 border border-[#C9A87C]/30 rounded-xl px-4 py-3 text-xs text-[#0B1F2D]/70">
                  🛏️ {extraBeds} cama{extraBeds > 1 ? "s" : ""} extra (+${extraBeds * extraBedPrice}/noche)
                </div>
              )}

              <div className="flex justify-between items-center pt-2 border-t border-[#0B1F2D]/10">
                <p className="text-sm text-[#0B1F2D]/50">
                  {nights} {nights === 1 ? "noche" : "noches"} · ${baseTotal.toLocaleString()}
                </p>
                <button onClick={() => setStep("extras")}
                  disabled={!isAvailable || availableRooms === 0}
                  className="bg-[#0B1F2D] hover:bg-[#0B1F2D]/80 disabled:bg-[#0B1F2D]/30 disabled:cursor-not-allowed text-white text-sm font-bold px-6 py-3 rounded-xl transition-colors">
                  Continuar →
                </button>
              </div>
            </div>
          )}

          {/* ── PASO 2: Experiencias y extras ─────────────── */}
          {step === "extras" && (
            <div className="space-y-6">

              {/* ── Sección EXTRAS ───────────────────────────── */}
              {extras.length > 0 && (
                <div className="bg-white rounded-2xl border border-[#0B1F2D]/10 p-8 shadow-sm space-y-5">
                  <div>
                    <p className="text-xs text-[#C9A87C] font-bold uppercase tracking-widest mb-1">Paso 2 de 3</p>
                    <h2 className="text-2xl font-black text-[#0B1F2D]">Servicios adicionales</h2>
                    <p className="text-sm text-[#0B1F2D]/40 mt-1">Opcional · servicios incluidos en tu estadía</p>
                  </div>

                  <div className="space-y-3">
                    {extras.map((e) => {
                      const qty    = selectedExtras[e.id] ?? 0;
                      const active = qty > 0;
                      const icon   = EXTRA_ICONS[e.type] ?? "✨";
                      return (
                        <div key={e.id}
                          className={`p-5 rounded-2xl border-2 transition-all ${
                            active ? "border-[#C9A87C] bg-[#C9A87C]/5" : "border-[#0B1F2D]/10 hover:border-[#0B1F2D]/20"
                          }`}>
                          <div className="flex items-start gap-4">
                            {/* Imagen o ícono */}
                            <div className="w-14 h-14 rounded-xl overflow-hidden bg-[#FAF6F0] border border-[#0B1F2D]/10 shrink-0 flex items-center justify-center text-2xl">
                              {e.image
                                ? <img src={e.image} alt={e.name} className="w-full h-full object-cover" />
                                : icon}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-start justify-between gap-4">
                                <div>
                                  <p className="font-bold text-[#0B1F2D]">{e.name}</p>
                                  {e.description && (
                                    <p className="text-xs text-[#0B1F2D]/50 mt-0.5">{e.description}</p>
                                  )}
                                </div>
                                <p className="font-black text-[#0B1F2D] shrink-0">${e.price.toLocaleString()}</p>
                              </div>
                              {!active ? (
                                <button onClick={() => toggleExtra(e.id)}
                                  className="mt-3 text-xs font-bold text-[#C9A87C] hover:text-[#C9A87C]/70 transition-colors">
                                  + Agregar
                                </button>
                              ) : (
                                <div className="mt-3 flex items-center gap-3">
                                  <button onClick={() => changeExtraQty(e.id, -1)}
                                    className="w-7 h-7 rounded-full bg-white border border-[#0B1F2D]/20 hover:border-[#C9A87C] text-sm font-bold transition-colors">−</button>
                                  <span className="text-sm font-black text-[#0B1F2D] min-w-[20px] text-center">{qty}</span>
                                  <button onClick={() => changeExtraQty(e.id, 1)}
                                    className="w-7 h-7 rounded-full bg-white border border-[#0B1F2D]/20 hover:border-[#C9A87C] text-sm font-bold transition-colors">+</button>
                                  <button onClick={() => toggleExtra(e.id)}
                                    className="ml-auto text-xs text-rose-500 hover:text-rose-600 font-medium transition-colors">
                                    Quitar
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ── Sección EXPERIENCIAS ─────────────────────── */}
              {experiences.length > 0 && (
                <div className="bg-white rounded-2xl border border-[#0B1F2D]/10 p-8 shadow-sm space-y-5">
                  {extras.length === 0 && (
                    <div>
                      <p className="text-xs text-[#C9A87C] font-bold uppercase tracking-widest mb-1">Paso 2 de 3</p>
                    </div>
                  )}
                  <div>
                    <h2 className="text-2xl font-black text-[#0B1F2D]">Experiencias únicas</h2>
                    <p className="text-sm text-[#0B1F2D]/40 mt-1">Opcional · actividades especiales del hotel</p>
                  </div>

                  <div className="space-y-3">
                    {experiences.map((e) => {
                      const qty    = selectedExperiences[e.id] ?? 0;
                      const active = qty > 0;
                      const icon   = EXPERIENCE_ICONS[e.category] ?? "🌟";
                      return (
                        <div key={e.id}
                          className={`p-5 rounded-2xl border-2 transition-all ${
                            active ? "border-[#C9A87C] bg-[#C9A87C]/5" : "border-[#0B1F2D]/10 hover:border-[#0B1F2D]/20"
                          }`}>
                          <div className="flex items-start gap-4">
                            {/* Imagen o ícono */}
                            <div className="w-14 h-14 rounded-xl overflow-hidden bg-[#FAF6F0] border border-[#0B1F2D]/10 shrink-0 flex items-center justify-center text-2xl">
                              {e.images?.[0]
                                ? <img src={e.images[0]} alt={e.name} className="w-full h-full object-cover" />
                                : icon}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-start justify-between gap-4">
                                <div>
                                  <p className="font-bold text-[#0B1F2D]">{e.name}</p>
                                  {e.description && (
                                    <p className="text-xs text-[#0B1F2D]/50 mt-0.5">{e.description}</p>
                                  )}
                                  {e.duration && (
                                    <p className="text-xs text-[#C9A87C] font-medium mt-1">⏱ {e.duration}</p>
                                  )}
                                </div>
                                <p className="font-black text-[#0B1F2D] shrink-0">${e.price.toLocaleString()}</p>
                              </div>
                              {!active ? (
                                <button onClick={() => toggleExperience(e.id)}
                                  className="mt-3 text-xs font-bold text-[#C9A87C] hover:text-[#C9A87C]/70 transition-colors">
                                  + Agregar
                                </button>
                              ) : (
                                <div className="mt-3 flex items-center gap-3">
                                  <button onClick={() => changeExperienceQty(e.id, -1)}
                                    className="w-7 h-7 rounded-full bg-white border border-[#0B1F2D]/20 hover:border-[#C9A87C] text-sm font-bold transition-colors">−</button>
                                  <span className="text-sm font-black text-[#0B1F2D] min-w-[20px] text-center">{qty}</span>
                                  <button onClick={() => changeExperienceQty(e.id, 1)}
                                    className="w-7 h-7 rounded-full bg-white border border-[#0B1F2D]/20 hover:border-[#C9A87C] text-sm font-bold transition-colors">+</button>
                                  <button onClick={() => toggleExperience(e.id)}
                                    className="ml-auto text-xs text-rose-500 hover:text-rose-600 font-medium transition-colors">
                                    Quitar
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Si el hotel no tiene nada configurado */}
              {extras.length === 0 && experiences.length === 0 && (
                <div className="bg-white rounded-2xl border border-[#0B1F2D]/10 p-8 shadow-sm text-center space-y-3">
                  <p className="text-xs text-[#C9A87C] font-bold uppercase tracking-widest">Paso 2 de 3</p>
                  <p className="text-4xl">🏖️</p>
                  <p className="font-bold text-[#0B1F2D]">Este hotel no tiene extras disponibles</p>
                  <p className="text-sm text-[#0B1F2D]/40">Puedes continuar directamente a confirmar tu reserva</p>
                </div>
              )}

              {/* Navegación */}
              <div className="flex justify-between items-center px-1">
                <button onClick={() => setStep("form")}
                  className="text-sm text-[#0B1F2D]/50 hover:text-[#0B1F2D] transition-colors">← Volver</button>
                <button onClick={() => setStep("review")}
                  className="bg-[#0B1F2D] hover:bg-[#0B1F2D]/80 text-white text-sm font-bold px-6 py-3 rounded-xl transition-colors">
                  Revisar reserva →
                </button>
              </div>
            </div>
          )}

          {/* ── PASO 3: Confirmar ──────────────────────────── */}
          {step === "review" && (
            <div className="bg-white rounded-2xl border border-[#0B1F2D]/10 p-8 shadow-sm space-y-6">
              <div>
                <p className="text-xs text-[#C9A87C] font-bold uppercase tracking-widest mb-2">Paso 3 de 3</p>
                <h2 className="text-2xl font-black text-[#0B1F2D]">Revisa y confirma tu reserva</h2>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-start py-3 border-b border-[#0B1F2D]/10">
                  <span className="text-sm text-[#0B1F2D]/50">Hotel</span>
                  <div className="text-right">
                    <p className="font-bold text-[#0B1F2D]">{hotel.name}</p>
                    <p className="text-xs text-[#0B1F2D]/40">📍 {hotel.location}</p>
                  </div>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-[#0B1F2D]/10">
                  <span className="text-sm text-[#0B1F2D]/50">Check-in</span>
                  <span className="font-semibold text-[#0B1F2D]">
                    {new Date(checkIn + "T12:00:00").toLocaleDateString("es-CL", { weekday: "short", day: "numeric", month: "long" })}
                  </span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-[#0B1F2D]/10">
                  <span className="text-sm text-[#0B1F2D]/50">Check-out</span>
                  <span className="font-semibold text-[#0B1F2D]">
                    {new Date(checkOut + "T12:00:00").toLocaleDateString("es-CL", { weekday: "short", day: "numeric", month: "long" })}
                  </span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-[#0B1F2D]/10">
                  <span className="text-sm text-[#0B1F2D]/50">Huéspedes</span>
                  <span className="font-semibold text-[#0B1F2D]">
                    {adults} adulto{adults !== 1 ? "s" : ""}{children > 0 ? ` · ${children} niño${children !== 1 ? "s" : ""}` : ""}
                  </span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-[#0B1F2D]/10">
                  <span className="text-sm text-[#0B1F2D]/50">Noches</span>
                  <span className="font-semibold text-[#0B1F2D]">{nights}</span>
                </div>

                {/* Extras seleccionados */}
                {selectedExtraItems.length > 0 && (
                  <div className="py-3 border-b border-[#0B1F2D]/10 space-y-2">
                    <span className="text-sm text-[#0B1F2D]/50 block mb-2">Servicios adicionales</span>
                    {selectedExtraItems.map((e) => (
                      <div key={e.id} className="flex justify-between items-center">
                        <span className="text-sm text-[#0B1F2D]">{e.name} ×{e.quantity}</span>
                        <span className="text-sm font-semibold text-[#0B1F2D]">${(e.price * e.quantity).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Experiencias seleccionadas */}
                {selectedExperienceItems.length > 0 && (
                  <div className="py-3 border-b border-[#0B1F2D]/10 space-y-2">
                    <span className="text-sm text-[#0B1F2D]/50 block mb-2">Experiencias</span>
                    {selectedExperienceItems.map((e) => (
                      <div key={e.id} className="flex justify-between items-center">
                        <span className="text-sm text-[#0B1F2D]">{e.name} ×{e.quantity}</span>
                        <span className="text-sm font-semibold text-[#0B1F2D]">${(e.price * e.quantity).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {error && (
                <div className="bg-rose-50 border border-rose-100 rounded-xl px-4 py-3">
                  <p className="text-xs text-rose-600 font-medium">{error}</p>
                </div>
              )}

              <div className="flex justify-between items-center pt-2 border-t border-[#0B1F2D]/10">
                <button onClick={() => setStep("extras")}
                  className="text-sm text-[#0B1F2D]/50 hover:text-[#0B1F2D] transition-colors">← Volver</button>
                <button onClick={handleSubmit} disabled={submitting}
                  className="bg-[#C9A87C] hover:bg-[#C9A87C]/80 disabled:bg-[#0B1F2D]/20 text-white text-sm font-bold px-8 py-3 rounded-xl transition-colors shadow-lg shadow-[#C9A87C]/30 disabled:shadow-none disabled:cursor-not-allowed">
                  {submitting ? "Creando reserva..." : "Confirmar reserva ✓"}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── Sidebar resumen ────────────────────────────── */}
        <div className="lg:sticky lg:top-24 self-start">
          <div className="bg-white rounded-2xl border border-[#0B1F2D]/10 shadow-sm overflow-hidden">
            <div className="aspect-video bg-[#0B1F2D]/5">
              <img
                src={hotel.images?.[0] || "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800"}
                alt={hotel.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-6 space-y-4">
              <div>
                <h3 className="font-black text-[#0B1F2D]">{hotel.name}</h3>
                <p className="text-xs text-[#0B1F2D]/40 mt-0.5">📍 {hotel.location}</p>
                <div className="flex items-center gap-1 mt-1">
                  {[...Array(hotel.stars)].map((_, i) => (
                    <span key={i} className="text-[#C9A87C] text-xs">★</span>
                  ))}
                </div>
              </div>

              <div className="space-y-2 pt-4 border-t border-[#0B1F2D]/10">
                <div className="flex justify-between text-sm">
                  <span className="text-[#0B1F2D]/50">${hotel.price.toLocaleString()} × {nights} {nights === 1 ? "noche" : "noches"}</span>
                  <span className="font-semibold text-[#0B1F2D]">${(hotel.price * nights).toLocaleString()}</span>
                </div>
                {extraBeds > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-[#0B1F2D]/50">🛏️ {extraBeds} cama{extraBeds > 1 ? "s" : ""} extra × {nights}</span>
                    <span className="font-semibold text-[#0B1F2D]">${(extraBeds * extraBedPrice * nights).toLocaleString()}</span>
                  </div>
                )}
                {selectedExtraItems.map((e) => (
                  <div key={e.id} className="flex justify-between text-sm">
                    <span className="text-[#0B1F2D]/50">{e.name} ×{e.quantity}</span>
                    <span className="font-semibold text-[#0B1F2D]">${(e.price * e.quantity).toLocaleString()}</span>
                  </div>
                ))}
                {selectedExperienceItems.map((e) => (
                  <div key={e.id} className="flex justify-between text-sm">
                    <span className="text-[#0B1F2D]/50">{e.name} ×{e.quantity}</span>
                    <span className="font-semibold text-[#0B1F2D]">${(e.price * e.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-baseline pt-4 border-t border-[#0B1F2D]/10">
                <span className="font-black text-[#0B1F2D]">Total</span>
                <span className="text-2xl font-black text-[#0B1F2D]">${total.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}