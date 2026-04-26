"use client";
// app/hotels/[id]/reserve/page.tsx

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";

const EXTRAS = [
  { type: "BREAKFAST", icon: "🥐", label: "Desayuno premium",  desc: "Buffet completo con productos locales", price: 25 },
  { type: "SPA",       icon: "💆", label: "Sesión de spa",     desc: "60 minutos con masaje relajante",       price: 80 },
  { type: "TOUR",      icon: "🗺️", label: "Tour guiado",       desc: "Excursión local con guía especializado", price: 60 },
  { type: "TRANSPORT", icon: "🚗", label: "Transporte privado", desc: "Traslado desde aeropuerto/terminal",     price: 45 },
];

type Hotel = {
  id: string;
  name: string;
  location: string;
  price: number;
  stars: number;
  description: string;
  images: string[];
  experienceType: string;
};

export default function ReservePage() {
  const router = useRouter();
  const params = useParams();
  const hotelId = params.id as string;

  const [hotel, setHotel]       = useState<Hotel | null>(null);
  const [loading, setLoading]   = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]       = useState("");
  const [step, setStep]         = useState<"form" | "extras" | "review" | "done">("form");

  // Form
  const today    = new Date().toISOString().split("T")[0];
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split("T")[0];

  const [checkIn, setCheckIn]   = useState(today);
  const [checkOut, setCheckOut] = useState(tomorrow);
  const [guests, setGuests]     = useState(2);
  const [selectedExtras, setSelectedExtras] = useState<Record<string, number>>({});

  // Cargar hotel
  useEffect(() => {
    fetch(`/api/hotels/${hotelId}`)
      .then((r) => r.json())
      .then((data) => { setHotel(data); setLoading(false); })
      .catch(() => { setError("Error cargando hotel"); setLoading(false); });
  }, [hotelId]);

  // Cálculos
  const nights = Math.max(1, Math.ceil(
    (new Date(checkOut).getTime() - new Date(checkIn).getTime()) / (1000 * 60 * 60 * 24)
  ));
  const baseTotal   = (hotel?.price ?? 0) * nights;
  const extrasArray = EXTRAS
    .filter((e) => (selectedExtras[e.type] ?? 0) > 0)
    .map((e) => ({ ...e, quantity: selectedExtras[e.type] }));
  const extrasTotal = extrasArray.reduce((sum, e) => sum + e.price * e.quantity, 0);
  const total       = baseTotal + extrasTotal;

  function toggleExtra(type: string) {
    setSelectedExtras((prev) => ({
      ...prev,
      [type]: (prev[type] ?? 0) > 0 ? 0 : 1,
    }));
  }

  function changeQty(type: string, delta: number) {
    setSelectedExtras((prev) => ({
      ...prev,
      [type]: Math.max(0, Math.min(10, (prev[type] ?? 0) + delta)),
    }));
  }

  async function handleSubmit() {
    setSubmitting(true); setError("");

    const res = await fetch("/api/reservations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        hotelId,
        checkIn,
        checkOut,
        guests,
        extras: extrasArray.map((e) => ({
          type:     e.type,
          price:    e.price,
          quantity: e.quantity,
        })),
      }),
    });

    setSubmitting(false);
    if (!res.ok) { setError("Error al crear la reserva"); return; }
    setStep("done");
    setTimeout(() => router.push("/dashboard"), 3000);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <p className="text-stone-400">Cargando hotel...</p>
      </div>
    );
  }

  if (!hotel) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <p className="text-stone-400">Hotel no encontrado</p>
      </div>
    );
  }

  // ── Pantalla de éxito ─────────────────────────────────────────
  if (step === "done") {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center p-6">
        <div className="text-center space-y-6 max-w-md">
          <div className="w-24 h-24 bg-teal-100 rounded-full flex items-center justify-center text-5xl mx-auto">✅</div>
          <div>
            <h1 className="text-3xl font-black text-slate-900">¡Reserva creada!</h1>
            <p className="text-slate-500 mt-2">Tu reserva en {hotel.name} está pendiente de confirmación.</p>
          </div>
          <Link href="/dashboard" className="inline-block bg-slate-900 hover:bg-teal-600 text-white text-sm font-bold px-6 py-3 rounded-xl transition-colors">
            Ver mis reservas →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Navbar */}
      <nav className="bg-white border-b border-stone-100 px-8 h-16 flex items-center justify-between sticky top-0 z-10">
        <Link href="/hotels" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
            <span className="text-white text-xs font-black">W</span>
          </div>
          <span className="text-lg font-bold text-slate-900">Wave<span className="text-teal-500">.</span></span>
        </Link>
        <Link href={`/hotels`} className="text-sm text-slate-500 hover:text-slate-900 transition-colors">
          ← Volver a hoteles
        </Link>
      </nav>

      {/* Stepper */}
      <div className="bg-white border-b border-stone-100 py-6">
        <div className="max-w-5xl mx-auto px-8 flex items-center justify-center gap-4">
          {[
            { key: "form",    num: 1, label: "Fechas y huéspedes" },
            { key: "extras",  num: 2, label: "Experiencias" },
            { key: "review",  num: 3, label: "Confirmar" },
          ].map((s, i, arr) => (
            <div key={s.key} className="flex items-center gap-3">
              <div className={`flex items-center gap-2 ${
                step === s.key ? "" : "opacity-40"
              }`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                  step === s.key ? "bg-teal-500 text-white" : "bg-slate-200 text-slate-500"
                }`}>
                  {s.num}
                </div>
                <span className="text-sm font-semibold text-slate-700 hidden md:block">{s.label}</span>
              </div>
              {i < arr.length - 1 && <div className="w-8 h-px bg-slate-200" />}
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-8 py-10 grid lg:grid-cols-3 gap-8">

        {/* ── Contenido principal ────────────────────────────────── */}
        <div className="lg:col-span-2 space-y-6">

          {/* PASO 1: Fechas y huéspedes */}
          {step === "form" && (
            <div className="bg-white rounded-2xl border border-stone-100 p-8 shadow-sm space-y-6">
              <div>
                <p className="text-xs text-teal-600 font-bold uppercase tracking-widest mb-2">Paso 1 de 3</p>
                <h2 className="text-2xl font-black text-slate-900">Selecciona fechas y huéspedes</h2>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wider">Check-in</label>
                  <input type="date" value={checkIn} min={today}
                    onChange={(e) => setCheckIn(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3.5 text-sm outline-none focus:border-teal-400 focus:ring-4 focus:ring-teal-100 transition-all" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wider">Check-out</label>
                  <input type="date" value={checkOut} min={checkIn}
                    onChange={(e) => setCheckOut(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-4 py-3.5 text-sm outline-none focus:border-teal-400 focus:ring-4 focus:ring-teal-100 transition-all" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-2 uppercase tracking-wider">Huéspedes</label>
                <div className="flex items-center gap-4 bg-slate-50 rounded-xl px-4 py-3">
                  <button type="button" onClick={() => setGuests(Math.max(1, guests - 1))}
                    className="w-9 h-9 rounded-full bg-white border border-slate-200 hover:border-teal-400 text-slate-700 font-bold transition-colors">−</button>
                  <span className="text-2xl font-black text-slate-900 min-w-[40px] text-center">{guests}</span>
                  <button type="button" onClick={() => setGuests(Math.min(10, guests + 1))}
                    className="w-9 h-9 rounded-full bg-white border border-slate-200 hover:border-teal-400 text-slate-700 font-bold transition-colors">+</button>
                  <span className="text-sm text-slate-500 ml-2">{guests === 1 ? "persona" : "personas"}</span>
                </div>
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                <p className="text-sm text-slate-500">
                  {nights} {nights === 1 ? "noche" : "noches"} · ${(hotel.price * nights).toLocaleString()}
                </p>
                <button onClick={() => setStep("extras")}
                  className="bg-slate-900 hover:bg-teal-600 text-white text-sm font-bold px-6 py-3 rounded-xl transition-colors">
                  Continuar →
                </button>
              </div>
            </div>
          )}

          {/* PASO 2: Experiencias */}
          {step === "extras" && (
            <div className="bg-white rounded-2xl border border-stone-100 p-8 shadow-sm space-y-6">
              <div>
                <p className="text-xs text-teal-600 font-bold uppercase tracking-widest mb-2">Paso 2 de 3</p>
                <h2 className="text-2xl font-black text-slate-900">Suma experiencias a tu estadía</h2>
                <p className="text-sm text-slate-500 mt-1">Opcional · puedes saltarte este paso</p>
              </div>

              <div className="space-y-3">
                {EXTRAS.map((e) => {
                  const qty = selectedExtras[e.type] ?? 0;
                  const active = qty > 0;
                  return (
                    <div key={e.type}
                      className={`p-5 rounded-2xl border-2 transition-all ${
                        active ? "border-teal-400 bg-teal-50/30" : "border-slate-100 hover:border-slate-200"
                      }`}>
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-white rounded-xl border border-slate-100 flex items-center justify-center text-2xl shrink-0">
                          {e.icon}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between gap-4">
                            <div>
                              <p className="font-bold text-slate-900">{e.label}</p>
                              <p className="text-xs text-slate-500 mt-0.5">{e.desc}</p>
                            </div>
                            <p className="font-black text-slate-900 shrink-0">${e.price}</p>
                          </div>

                          {!active ? (
                            <button onClick={() => toggleExtra(e.type)}
                              className="mt-3 text-xs font-bold text-teal-600 hover:text-teal-700 transition-colors">
                              + Agregar
                            </button>
                          ) : (
                            <div className="mt-3 flex items-center gap-3">
                              <button onClick={() => changeQty(e.type, -1)}
                                className="w-7 h-7 rounded-full bg-white border border-slate-200 hover:border-teal-400 text-sm font-bold transition-colors">−</button>
                              <span className="text-sm font-black text-slate-900 min-w-[20px] text-center">{qty}</span>
                              <button onClick={() => changeQty(e.type, 1)}
                                className="w-7 h-7 rounded-full bg-white border border-slate-200 hover:border-teal-400 text-sm font-bold transition-colors">+</button>
                              <button onClick={() => toggleExtra(e.type)}
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

              <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                <button onClick={() => setStep("form")}
                  className="text-sm text-slate-500 hover:text-slate-900 transition-colors">
                  ← Volver
                </button>
                <button onClick={() => setStep("review")}
                  className="bg-slate-900 hover:bg-teal-600 text-white text-sm font-bold px-6 py-3 rounded-xl transition-colors">
                  Revisar reserva →
                </button>
              </div>
            </div>
          )}

          {/* PASO 3: Confirmar */}
          {step === "review" && (
            <div className="bg-white rounded-2xl border border-stone-100 p-8 shadow-sm space-y-6">
              <div>
                <p className="text-xs text-teal-600 font-bold uppercase tracking-widest mb-2">Paso 3 de 3</p>
                <h2 className="text-2xl font-black text-slate-900">Revisa y confirma tu reserva</h2>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-start py-3 border-b border-slate-100">
                  <span className="text-sm text-slate-500">Hotel</span>
                  <div className="text-right">
                    <p className="font-bold text-slate-900">{hotel.name}</p>
                    <p className="text-xs text-slate-400">📍 {hotel.location}</p>
                  </div>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-slate-100">
                  <span className="text-sm text-slate-500">Check-in</span>
                  <span className="font-semibold text-slate-900">{new Date(checkIn).toLocaleDateString("es-CL", { weekday: "short", day: "numeric", month: "long" })}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-slate-100">
                  <span className="text-sm text-slate-500">Check-out</span>
                  <span className="font-semibold text-slate-900">{new Date(checkOut).toLocaleDateString("es-CL", { weekday: "short", day: "numeric", month: "long" })}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-slate-100">
                  <span className="text-sm text-slate-500">Huéspedes</span>
                  <span className="font-semibold text-slate-900">{guests} {guests === 1 ? "persona" : "personas"}</span>
                </div>
                <div className="flex justify-between items-center py-3">
                  <span className="text-sm text-slate-500">Noches</span>
                  <span className="font-semibold text-slate-900">{nights}</span>
                </div>
              </div>

              {error && (
                <div className="bg-rose-50 border border-rose-100 rounded-xl px-4 py-3">
                  <p className="text-xs text-rose-600 font-medium">{error}</p>
                </div>
              )}

              <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                <button onClick={() => setStep("extras")}
                  className="text-sm text-slate-500 hover:text-slate-900 transition-colors">
                  ← Volver
                </button>
                <button onClick={handleSubmit} disabled={submitting}
                  className="bg-teal-600 hover:bg-teal-700 disabled:bg-slate-300 text-white text-sm font-bold px-8 py-3 rounded-xl transition-colors shadow-lg shadow-teal-200 disabled:shadow-none disabled:cursor-not-allowed">
                  {submitting ? "Creando reserva..." : "Confirmar reserva ✓"}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── Resumen lateral ────────────────────────────────────── */}
        <div className="lg:sticky lg:top-24 self-start">
          <div className="bg-white rounded-2xl border border-stone-100 shadow-sm overflow-hidden">
            <div className="aspect-video bg-slate-100">
              <img src={hotel.images?.[0] || "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800"}
                alt={hotel.name} className="w-full h-full object-cover" />
            </div>
            <div className="p-6 space-y-4">
              <div>
                <h3 className="font-black text-slate-900">{hotel.name}</h3>
                <p className="text-xs text-slate-400 mt-0.5">📍 {hotel.location}</p>
                <div className="flex items-center gap-1 mt-1">
                  {[...Array(hotel.stars)].map((_, i) => <span key={i} className="text-teal-400 text-xs">★</span>)}
                </div>
              </div>

              <div className="space-y-2 pt-4 border-t border-slate-100">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">${hotel.price.toLocaleString()} × {nights} {nights === 1 ? "noche" : "noches"}</span>
                  <span className="font-semibold text-slate-900">${baseTotal.toLocaleString()}</span>
                </div>

                {extrasArray.map((e) => (
                  <div key={e.type} className="flex justify-between text-sm">
                    <span className="text-slate-500">{e.icon} {e.label} ×{e.quantity}</span>
                    <span className="font-semibold text-slate-900">${(e.price * e.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-baseline pt-4 border-t border-slate-100">
                <span className="font-black text-slate-900">Total</span>
                <span className="text-2xl font-black text-slate-900">${total.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
