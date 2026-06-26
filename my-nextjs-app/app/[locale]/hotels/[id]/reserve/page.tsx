"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Link, useRouter } from "@/i18n/navigation";

// ── Types ────────────────────────────────────────────────────────────────────

type Hotel = {
  id: string;
  name: string;
  price: number;
  extraBedPrice: number;
  totalRooms: number;
};

type RoomType = {
  id: string;
  name: string;
  capacity: number;
  count: number;
  pricePerNight: number;
  maxExtraBeds: number;
  extraBedPrice: number;
};

type ExtraItem = {
  id: string;
  name: string;
  description?: string | null;
  price: number;
  kind: "extra" | "experience";
};

// ── Shared style tokens ───────────────────────────────────────────────────────

const FL = "w-full border border-[#0B1F2D]/20 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#C9A87C] focus:ring-4 focus:ring-[#C9A87C]/15 transition-all bg-white";

// ── Step indicator ────────────────────────────────────────────────────────────

function StepIndicator({ current }: { current: number }) {
  const LABELS = ["Estadía", "Experiencias", "Confirmar"];
  return (
    <div className="flex items-center">
      {LABELS.map((label, i) => {
        const n      = i + 1;
        const done   = n < current;
        const active = n === current;
        return (
          <div key={n} className="flex items-center flex-1 last:flex-none">
            <div className="flex items-center gap-2 shrink-0">
              <div
                className={`w-7 h-7 rounded-full text-xs font-bold flex items-center justify-center transition-colors ${
                  done   ? "bg-[#C9A87C] text-white" :
                  active ? "bg-[#0B1F2D] text-white" :
                           "bg-[#0B1F2D]/10 text-[#0B1F2D]/35"
                }`}
              >
                {done ? "✓" : n}
              </div>
              <span
                className={`text-xs font-semibold hidden sm:inline transition-colors ${
                  active ? "text-[#0B1F2D]" : "text-[#0B1F2D]/35"
                }`}
              >
                {label}
              </span>
            </div>
            {i < LABELS.length - 1 && (
              <div className={`flex-1 h-px mx-3 ${done ? "bg-[#C9A87C]" : "bg-[#0B1F2D]/10"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Counter widget ────────────────────────────────────────────────────────────

function Counter({
  value, min, max, onChange,
}: {
  value: number; min: number; max?: number; onChange: (n: number) => void;
}) {
  const btn = "w-9 h-9 rounded-lg border border-[#0B1F2D]/20 font-bold text-base flex items-center justify-center hover:border-[#C9A87C] transition-colors disabled:opacity-30 disabled:cursor-not-allowed";
  return (
    <div className="flex items-center gap-3">
      <button type="button" className={btn} disabled={value <= min} onClick={() => onChange(Math.max(min, value - 1))}>−</button>
      <span className="text-lg font-bold text-[#0B1F2D] w-6 text-center tabular-nums">{value}</span>
      <button type="button" className={btn} disabled={max !== undefined && value >= max} onClick={() => onChange(max !== undefined ? Math.min(max, value + 1) : value + 1)}>+</button>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function ReservePage() {
  const params  = useParams<{ id: string }>();
  const hotelId = params.id;
  const router  = useRouter();

  const [step, setStep] = useState(1);

  // Remote data
  const [hotel, setHotel]         = useState<Hotel | null>(null);
  const [roomTypes, setRoomTypes] = useState<RoomType[]>([]);
  const [loading, setLoading]     = useState(true);
  const [loadError, setLoadError] = useState("");

  // Step 1 form state
  const [checkIn, setCheckIn]                       = useState("");
  const [checkOut, setCheckOut]                     = useState("");
  const [adults, setAdults]                         = useState(2);
  const [children, setChildren]                     = useState(0);
  const [rooms, setRooms]                           = useState(1);
  const [selectedRoomTypeId, setSelectedRoomTypeId] = useState<string | null>(null);
  const [extraBeds, setExtraBeds]                   = useState(0);

  // Step 2 state
  const [extrasItems, setExtrasItems]           = useState<ExtraItem[]>([]);
  const [experienceItems, setExperienceItems]   = useState<ExtraItem[]>([]);
  const [extrasLoading, setExtrasLoading]       = useState(false);
  const [quantities, setQuantities]             = useState<Record<string, number>>({});

  // Step 3 state
  const [submitting, setSubmitting]   = useState(false);
  const [confirmError, setConfirmError] = useState("");

  const today = new Date().toISOString().split("T")[0];

  // ── Fetch hotel + roomTypes on mount ────────────────────────────────────────
  useEffect(() => {
    async function load() {
      try {
        const hotelRes  = await fetch(`/api/hotels/${hotelId}`);
        const hotelData = await hotelRes.json();

        if (!hotelRes.ok) {
          setLoadError(hotelData.error || "Hotel no encontrado");
          setLoading(false);
          return;
        }

        setHotel(hotelData);

        if (Array.isArray(hotelData.roomTypes) && hotelData.roomTypes.length > 0) {
          setRoomTypes(hotelData.roomTypes);
          setSelectedRoomTypeId(hotelData.roomTypes[0].id);
        }
      } catch {
        setLoadError("Error de red al cargar el hotel");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [hotelId]);

  // ── Fetch extras/experiences when entering step 2 ───────────────────────────
  useEffect(() => {
    if (step !== 2) return;
    setExtrasLoading(true);
    fetch(`/api/hotels/${hotelId}/experiences-extras`)
      .then((r) => r.json())
      .then((data) => {
        setExtrasItems(
          (data.extras ?? []).map((e: { id: string; name: string; description?: string | null; price: number }) => ({
            ...e, kind: "extra" as const,
          }))
        );
        setExperienceItems(
          (data.experiences ?? []).map((e: { id: string; name: string; description?: string | null; price: number }) => ({
            ...e, kind: "experience" as const,
          }))
        );
      })
      .catch(() => {})
      .finally(() => setExtrasLoading(false));
  }, [step, hotelId]);

  // ── Derived price calculations ──────────────────────────────────────────────
  const nights = (() => {
    if (!checkIn || !checkOut) return 0;
    const ms = new Date(checkOut).getTime() - new Date(checkIn).getTime();
    const d  = Math.ceil(ms / 86_400_000);
    return d > 0 ? d : 0;
  })();

  const selectedRoom  = roomTypes.find((r) => r.id === selectedRoomTypeId) ?? null;
  const pricePerNight = selectedRoom ? selectedRoom.pricePerNight : (hotel?.price ?? 0);
  const xBedPrice     = selectedRoom ? selectedRoom.extraBedPrice : (hotel?.extraBedPrice ?? 50);
  const maxExtraBeds  = selectedRoom ? selectedRoom.maxExtraBeds  : 2;
  const maxRooms      = selectedRoom ? selectedRoom.count         : (hotel?.totalRooms ?? 10);

  const roomsSubtotal = pricePerNight * nights * rooms;
  const bedsSubtotal  = extraBeds * xBedPrice * nights * rooms;

  const allItems    = [...extrasItems, ...experienceItems];
  const extrasTotal = allItems.reduce((sum, item) => sum + (quantities[item.id] ?? 0) * item.price, 0);

  const grandTotal = roomsSubtotal + bedsSubtotal + extrasTotal;

  const step1Valid = !!checkIn && !!checkOut && nights > 0 &&
    (roomTypes.length === 0 || !!selectedRoomTypeId);

  // ── Quantity helpers ─────────────────────────────────────────────────────────
  function setQty(id: string, qty: number) {
    setQuantities((prev) => {
      if (qty <= 0) {
        const next = { ...prev };
        delete next[id];
        return next;
      }
      return { ...prev, [id]: qty };
    });
  }

  // ── Confirm reservation ──────────────────────────────────────────────────────
  async function handleConfirm() {
    setSubmitting(true);
    setConfirmError("");

    const selectedExtras = allItems
      .filter((item) => (quantities[item.id] ?? 0) > 0)
      .map((item) => ({
        ...(item.kind === "extra" ? { extraServiceId: item.id } : { experienceId: item.id }),
        name:     item.name,
        price:    item.price,
        quantity: quantities[item.id],
      }));

    const res = await fetch("/api/reservations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        hotelId,
        checkIn,
        checkOut,
        guests:     adults + children,
        rooms,
        totalPrice: grandTotal,
        extras:     selectedExtras,
      }),
    });

    setSubmitting(false);

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setConfirmError(data.error || "Error al confirmar la reserva");
      return;
    }

    router.push("/dashboard");
  }

  // ── Loading / error states ──────────────────────────────────────────────────
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

  if (!hotel) {
    return (
      <div className="min-h-screen bg-[#FAF6F0] flex items-center justify-center">
        <p className="text-rose-500 text-sm">{loadError || "Hotel no encontrado"}</p>
      </div>
    );
  }

  // ── Step 2 — Extras y experiencias ──────────────────────────────────────────
  if (step === 2) {
    const hasContent = extrasItems.length > 0 || experienceItems.length > 0;

    return (
      <div className="min-h-screen bg-[#FAF6F0]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
          <StepIndicator current={2} />

          <div className="mt-8 grid md:grid-cols-3 gap-6">

            {/* ── Left column ───────────────────────────────────────────────── */}
            <div className="md:col-span-2 space-y-4">

              {extrasLoading ? (
                <div className="bg-white rounded-2xl border border-[#0B1F2D]/10 p-10 shadow-sm flex justify-center">
                  <div className="w-6 h-6 border-2 border-[#C9A87C] border-t-transparent rounded-full animate-spin" />
                </div>
              ) : !hasContent ? (
                <div className="bg-white rounded-2xl border border-[#0B1F2D]/10 p-10 shadow-sm text-center">
                  <p className="text-[#0B1F2D]/40 text-sm">
                    Este hotel no tiene extras ni experiencias disponibles.
                  </p>
                </div>
              ) : (
                <>
                  {/* Servicios adicionales */}
                  {extrasItems.length > 0 && (
                    <div className="bg-white rounded-2xl border border-[#0B1F2D]/10 p-6 shadow-sm">
                      <h2 className="font-bold text-[#0B1F2D] mb-4">Servicios adicionales</h2>
                      <div className="space-y-3">
                        {extrasItems.map((item) => {
                          const qty = quantities[item.id] ?? 0;
                          return (
                            <div
                              key={item.id}
                              className="flex items-center justify-between p-4 rounded-xl border border-[#0B1F2D]/8 bg-[#FAF6F0]/50"
                            >
                              <div className="flex-1 min-w-0 mr-4">
                                <p className="font-semibold text-[#0B1F2D] text-sm">{item.name}</p>
                                {item.description && (
                                  <p className="text-xs text-[#0B1F2D]/40 mt-0.5 line-clamp-1">{item.description}</p>
                                )}
                                <p className="text-xs font-bold text-[#C9A87C] mt-1">${item.price}</p>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                {qty > 0 && (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() => setQty(item.id, qty - 1)}
                                      className="w-8 h-8 rounded-lg border border-[#0B1F2D]/20 font-bold flex items-center justify-center hover:border-[#C9A87C] transition-colors"
                                    >
                                      −
                                    </button>
                                    <span className="w-5 text-center font-bold text-sm tabular-nums">{qty}</span>
                                  </>
                                )}
                                <button
                                  type="button"
                                  onClick={() => setQty(item.id, qty + 1)}
                                  className={`w-8 h-8 rounded-lg font-bold flex items-center justify-center transition-colors ${
                                    qty > 0
                                      ? "border border-[#0B1F2D]/20 hover:border-[#C9A87C]"
                                      : "bg-[#C9A87C] text-white hover:bg-[#C9A87C]/80"
                                  }`}
                                >
                                  +
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Experiencias */}
                  {experienceItems.length > 0 && (
                    <div className="bg-white rounded-2xl border border-[#0B1F2D]/10 p-6 shadow-sm">
                      <h2 className="font-bold text-[#0B1F2D] mb-4">Experiencias</h2>
                      <div className="space-y-3">
                        {experienceItems.map((item) => {
                          const qty = quantities[item.id] ?? 0;
                          return (
                            <div
                              key={item.id}
                              className="flex items-center justify-between p-4 rounded-xl border border-[#0B1F2D]/8 bg-[#FAF6F0]/50"
                            >
                              <div className="flex-1 min-w-0 mr-4">
                                <p className="font-semibold text-[#0B1F2D] text-sm">{item.name}</p>
                                {item.description && (
                                  <p className="text-xs text-[#0B1F2D]/40 mt-0.5 line-clamp-1">{item.description}</p>
                                )}
                                <p className="text-xs font-bold text-[#C9A87C] mt-1">${item.price} por persona</p>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                {qty > 0 && (
                                  <>
                                    <button
                                      type="button"
                                      onClick={() => setQty(item.id, qty - 1)}
                                      className="w-8 h-8 rounded-lg border border-[#0B1F2D]/20 font-bold flex items-center justify-center hover:border-[#C9A87C] transition-colors"
                                    >
                                      −
                                    </button>
                                    <span className="w-5 text-center font-bold text-sm tabular-nums">{qty}</span>
                                  </>
                                )}
                                <button
                                  type="button"
                                  onClick={() => setQty(item.id, qty + 1)}
                                  className={`w-8 h-8 rounded-lg font-bold flex items-center justify-center transition-colors ${
                                    qty > 0
                                      ? "border border-[#0B1F2D]/20 hover:border-[#C9A87C]"
                                      : "bg-[#C9A87C] text-white hover:bg-[#C9A87C]/80"
                                  }`}
                                >
                                  +
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* ── Sidebar ───────────────────────────────────────────────────── */}
            <div className="md:col-span-1">
              <div className="bg-[#0B1F2D] text-white rounded-2xl p-6 shadow-lg sticky top-6">
                <h3 className="text-xs font-bold uppercase tracking-wider text-white/50 mb-5">Resumen de precio</h3>

                <div className="space-y-3 text-sm mb-5">
                  <div className="flex justify-between">
                    <span className="text-white/60">${pricePerNight} × {nights}n × {rooms} hab.</span>
                    <span className="font-semibold">${roomsSubtotal.toLocaleString()}</span>
                  </div>
                  {extraBeds > 0 && (
                    <div className="flex justify-between">
                      <span className="text-white/60">{extraBeds} cama{extraBeds !== 1 ? "s" : ""} extra</span>
                      <span className="font-semibold">${bedsSubtotal.toLocaleString()}</span>
                    </div>
                  )}
                  {extrasTotal > 0 && (
                    <div className="flex justify-between">
                      <span className="text-white/60">Extras y experiencias</span>
                      <span className="font-semibold">${extrasTotal.toLocaleString()}</span>
                    </div>
                  )}
                </div>

                <div className="border-t border-white/10 pt-5 mb-6 flex justify-between items-end">
                  <span className="text-xs font-bold text-white/50 uppercase tracking-wider">Total</span>
                  <span className="text-3xl font-black">${grandTotal.toLocaleString()}</span>
                </div>

                <button
                  type="button"
                  onClick={() => setStep(3)}
                  className="w-full bg-[#C9A87C] hover:bg-[#C9A87C]/80 text-white font-bold py-3.5 rounded-xl transition-colors shadow-lg shadow-[#C9A87C]/20"
                >
                  Continuar →
                </button>
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="w-full mt-3 text-sm font-bold text-white/40 hover:text-white/70 transition-colors"
                >
                  ← Volver
                </button>
              </div>
            </div>

          </div>
        </div>
      </div>
    );
  }

  // ── Step 3 — Resumen y confirmación ─────────────────────────────────────────
  if (step === 3) {
    const selectedExtras = allItems.filter((item) => (quantities[item.id] ?? 0) > 0);

    return (
      <div className="min-h-screen bg-[#FAF6F0]">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 space-y-6">
          <StepIndicator current={3} />

          <div className="bg-white rounded-2xl border border-[#0B1F2D]/10 p-8 shadow-sm space-y-6">

            {/* Header */}
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-[#C9A87C] mb-1">Resumen de reserva</p>
              <h2 className="font-display text-2xl font-bold text-[#0B1F2D]">{hotel.name}</h2>
            </div>

            {/* Detalles de estadía */}
            <div className="grid sm:grid-cols-2 gap-4 py-5 border-t border-b border-[#0B1F2D]/8">
              <div>
                <p className="text-xs font-bold text-[#0B1F2D]/40 uppercase tracking-wider mb-1">Check-in</p>
                <p className="text-sm font-semibold text-[#0B1F2D]">{checkIn}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-[#0B1F2D]/40 uppercase tracking-wider mb-1">Check-out</p>
                <p className="text-sm font-semibold text-[#0B1F2D]">{checkOut}</p>
              </div>
              {selectedRoom && (
                <div className="sm:col-span-2">
                  <p className="text-xs font-bold text-[#0B1F2D]/40 uppercase tracking-wider mb-1">Tipo de habitación</p>
                  <p className="text-sm font-semibold text-[#0B1F2D]">{selectedRoom.name}</p>
                </div>
              )}
              <div>
                <p className="text-xs font-bold text-[#0B1F2D]/40 uppercase tracking-wider mb-1">Huéspedes</p>
                <p className="text-sm font-semibold text-[#0B1F2D]">
                  {adults} adulto{adults !== 1 ? "s" : ""}
                  {children > 0 && `, ${children} niño${children !== 1 ? "s" : ""}`}
                </p>
              </div>
              <div>
                <p className="text-xs font-bold text-[#0B1F2D]/40 uppercase tracking-wider mb-1">Habitaciones</p>
                <p className="text-sm font-semibold text-[#0B1F2D]">{rooms} × {nights} noche{nights !== 1 ? "s" : ""}</p>
              </div>
            </div>

            {/* Desglose de precios */}
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-[#0B1F2D]/60">
                  ${pricePerNight}/noche × {nights}n × {rooms} hab.
                </span>
                <span className="font-semibold text-[#0B1F2D]">${roomsSubtotal.toLocaleString()}</span>
              </div>
              {extraBeds > 0 && (
                <div className="flex justify-between">
                  <span className="text-[#0B1F2D]/60">
                    {extraBeds} cama{extraBeds !== 1 ? "s" : ""} extra × {nights}n × {rooms} hab.
                  </span>
                  <span className="font-semibold text-[#0B1F2D]">${bedsSubtotal.toLocaleString()}</span>
                </div>
              )}
              {selectedExtras.map((item) => (
                <div key={item.id} className="flex justify-between">
                  <span className="text-[#0B1F2D]/60">
                    {item.name} × {quantities[item.id]}
                  </span>
                  <span className="font-semibold text-[#0B1F2D]">
                    ${(item.price * (quantities[item.id] ?? 0)).toLocaleString()}
                  </span>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="border-t border-[#0B1F2D]/10 pt-5 flex justify-between items-end">
              <span className="text-sm font-bold text-[#0B1F2D]/50 uppercase tracking-wider">Total</span>
              <span className="text-3xl font-black text-[#0B1F2D]">${grandTotal.toLocaleString()}</span>
            </div>

            {/* Error */}
            {confirmError && (
              <div className="bg-rose-50 border border-rose-100 rounded-xl px-4 py-3">
                <p className="text-xs text-rose-600 font-medium">{confirmError}</p>
              </div>
            )}

            {/* Acciones */}
            <div className="flex justify-between items-center pt-2 border-t border-[#0B1F2D]/8">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="text-sm font-bold text-[#0B1F2D]/50 hover:text-[#0B1F2D] transition-colors"
              >
                ← Volver
              </button>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={submitting}
                className="bg-[#C9A87C] hover:bg-[#C9A87C]/80 disabled:bg-[#0B1F2D]/20 disabled:cursor-not-allowed text-white text-sm font-bold px-8 py-3.5 rounded-xl transition-colors shadow-lg shadow-[#C9A87C]/30 disabled:shadow-none"
              >
                {submitting ? "Confirmando..." : "Confirmar reserva ✓"}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Step 1 ──────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#FAF6F0]">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">

        <Link href={`/hotels/${hotelId}`} className="text-sm text-[#C9A87C] font-bold mb-6 inline-block">
          ← {hotel.name}
        </Link>

        <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-[#C9A87C] mb-1">Reservar</p>
        <h1 className="font-display text-3xl font-bold text-[#0B1F2D] mb-6">{hotel.name}</h1>

        <StepIndicator current={1} />

        <div className="mt-8 grid md:grid-cols-3 gap-6">

          {/* ── Left column ───────────────────────────────────────────────── */}
          <div className="md:col-span-2 space-y-4">

            {/* Fechas */}
            <div className="bg-white rounded-2xl border border-[#0B1F2D]/10 p-6 shadow-sm">
              <h2 className="font-bold text-[#0B1F2D] mb-5">Fechas</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#0B1F2D]/50 mb-2 uppercase tracking-wider">Check-in</label>
                  <input
                    type="date"
                    min={today}
                    value={checkIn}
                    onChange={(e) => {
                      setCheckIn(e.target.value);
                      if (checkOut && e.target.value >= checkOut) setCheckOut("");
                    }}
                    className={FL}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#0B1F2D]/50 mb-2 uppercase tracking-wider">Check-out</label>
                  <input
                    type="date"
                    min={checkIn || today}
                    value={checkOut}
                    onChange={(e) => setCheckOut(e.target.value)}
                    className={FL}
                  />
                </div>
              </div>
              {nights > 0 && (
                <p className="mt-3 text-xs text-[#C9A87C] font-semibold">
                  {nights} noche{nights !== 1 ? "s" : ""}
                </p>
              )}
            </div>

            {/* Tipo de habitación — solo si el hotel tiene roomTypes */}
            {roomTypes.length > 0 && (
              <div className="bg-white rounded-2xl border border-[#0B1F2D]/10 p-6 shadow-sm">
                <h2 className="font-bold text-[#0B1F2D] mb-4">Tipo de habitación</h2>
                <div className="space-y-2">
                  {roomTypes.map((rt) => (
                    <label
                      key={rt.id}
                      className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${
                        selectedRoomTypeId === rt.id
                          ? "border-[#C9A87C] bg-[#C9A87C]/5"
                          : "border-[#0B1F2D]/8 hover:border-[#C9A87C]/40 bg-[#FAF6F0]/50"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="roomType"
                          value={rt.id}
                          checked={selectedRoomTypeId === rt.id}
                          onChange={() => { setSelectedRoomTypeId(rt.id); setExtraBeds(0); }}
                          className="accent-[#C9A87C] w-4 h-4"
                        />
                        <div>
                          <p className="font-semibold text-[#0B1F2D] text-sm">{rt.name}</p>
                          <p className="text-xs text-[#0B1F2D]/40 mt-0.5">
                            {rt.capacity} persona{rt.capacity !== 1 ? "s" : ""} · {rt.count} disponible{rt.count !== 1 ? "s" : ""}
                          </p>
                        </div>
                      </div>
                      <span className="text-sm font-bold text-[#0B1F2D]">
                        ${rt.pricePerNight}
                        <span className="font-normal text-[#0B1F2D]/40">/noche</span>
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Huéspedes y habitaciones */}
            <div className="bg-white rounded-2xl border border-[#0B1F2D]/10 p-6 shadow-sm">
              <h2 className="font-bold text-[#0B1F2D] mb-5">Huéspedes y habitaciones</h2>
              <div className="grid sm:grid-cols-3 gap-6">
                <div>
                  <label className="block text-xs font-bold text-[#0B1F2D]/50 mb-3 uppercase tracking-wider">Adultos</label>
                  <Counter value={adults} min={1} onChange={setAdults} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#0B1F2D]/50 mb-3 uppercase tracking-wider">Niños</label>
                  <Counter value={children} min={0} onChange={setChildren} />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#0B1F2D]/50 mb-3 uppercase tracking-wider">Habitaciones</label>
                  <Counter value={rooms} min={1} max={maxRooms} onChange={setRooms} />
                  <p className="text-[10px] text-[#0B1F2D]/30 mt-1.5">Máx. {maxRooms}</p>
                </div>
              </div>
            </div>

            {/* Camas extra */}
            {maxExtraBeds > 0 && (
              <div className="bg-white rounded-2xl border border-[#0B1F2D]/10 p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="font-bold text-[#0B1F2D]">Camas extra</h2>
                    <p className="text-xs text-[#0B1F2D]/40 mt-0.5">
                      +${xBedPrice} por cama · por noche · por habitación
                    </p>
                  </div>
                  <Counter value={extraBeds} min={0} max={maxExtraBeds} onChange={setExtraBeds} />
                </div>
              </div>
            )}

          </div>

          {/* ── Sidebar ───────────────────────────────────────────────────── */}
          <div className="md:col-span-1">
            <div className="bg-[#0B1F2D] text-white rounded-2xl p-6 shadow-lg sticky top-6">
              <h3 className="text-xs font-bold uppercase tracking-wider text-white/50 mb-5">Resumen de precio</h3>

              <div className="space-y-3 text-sm mb-5 min-h-[3rem]">
                {nights > 0 ? (
                  <>
                    <div className="flex justify-between">
                      <span className="text-white/60">
                        ${pricePerNight} × {nights}n × {rooms} hab.
                      </span>
                      <span className="font-semibold">${roomsSubtotal.toLocaleString()}</span>
                    </div>
                    {extraBeds > 0 && (
                      <div className="flex justify-between">
                        <span className="text-white/60">
                          {extraBeds} cama{extraBeds !== 1 ? "s" : ""} extra × {nights}n × {rooms}h
                        </span>
                        <span className="font-semibold">${bedsSubtotal.toLocaleString()}</span>
                      </div>
                    )}
                    {selectedRoom && (
                      <p className="text-[10px] text-white/30 pt-1">
                        {selectedRoom.name} · {adults + children} huésped{adults + children !== 1 ? "es" : ""}
                      </p>
                    )}
                  </>
                ) : (
                  <p className="text-white/25 text-xs italic">Selecciona fechas para ver el precio</p>
                )}
              </div>

              <div className="border-t border-white/10 pt-5 mb-6 flex justify-between items-end">
                <span className="text-xs font-bold text-white/50 uppercase tracking-wider">Total</span>
                <span className="text-3xl font-black">
                  {nights > 0 ? `$${grandTotal.toLocaleString()}` : "—"}
                </span>
              </div>

              <button
                type="button"
                disabled={!step1Valid}
                onClick={() => step1Valid && setStep(2)}
                className="w-full bg-[#C9A87C] hover:bg-[#C9A87C]/80 disabled:bg-white/10 disabled:text-white/30 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl transition-colors shadow-lg shadow-[#C9A87C]/20 disabled:shadow-none"
              >
                Continuar →
              </button>

              {(!checkIn || !checkOut) && (
                <p className="text-[10px] text-white/25 text-center mt-2">Selecciona fechas para continuar</p>
              )}
              {checkIn && checkOut && nights <= 0 && (
                <p className="text-[10px] text-rose-400 text-center mt-2">El check-out debe ser posterior al check-in</p>
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
