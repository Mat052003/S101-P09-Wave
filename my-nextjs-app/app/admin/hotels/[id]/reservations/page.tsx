"use client";
// app/admin/hotels/[id]/reservations/page.tsx

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";

type Reservation = {
  id: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalPrice: number;
  status: string;
  createdAt: string;
  user: { name: string | null; email: string };
  extras: { type: string; quantity: number; price: number }[];
};

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string }> = {
  PENDING:   { label: "Pendiente",  bg: "bg-amber-50",  text: "text-amber-700"  },
  CONFIRMED: { label: "Confirmada", bg: "bg-teal-50",   text: "text-teal-700"   },
  CANCELLED: { label: "Cancelada",  bg: "bg-rose-50",   text: "text-rose-700"   },
};

export default function AdminHotelReservationsPage() {
  const params  = useParams();
  const router  = useRouter();
  const hotelId = params.id as string;

  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [hotelName, setHotelName]       = useState("");
  const [loading, setLoading]           = useState(true);

  useEffect(() => {
    // Cargar hotel
    fetch(`/api/admin/hotels/${hotelId}`)
      .then((r) => {
        if (r.status === 401 || r.status === 403) { router.push("/admin"); return null; }
        return r.json();
      })
      .then((data) => { if (data) setHotelName(data.name); });

    // Cargar reservas
    fetch(`/api/admin/hotels/${hotelId}/reservations`)
      .then((r) => r.json())
      .then((data) => {
        setReservations(data || []);
        setLoading(false);
      });
  }, [hotelId, router]);

  async function updateStatus(reservationId: string, status: string) {
    const res = await fetch(`/api/admin/reservations/${reservationId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      setReservations((prev) =>
        prev.map((r) => r.id === reservationId ? { ...r, status } : r)
      );
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center">
        <p className="text-stone-400">Cargando reservas...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50">
      <div className="max-w-5xl mx-auto px-6 py-10 space-y-8">

        <div>
          <Link href="/admin" className="text-sm text-stone-500 hover:text-slate-900 transition-colors">
            ← Volver al panel
          </Link>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-teal-600 mt-4 mb-2">Reservas recibidas</p>
          <h1 className="text-3xl font-black text-slate-900">{hotelName}</h1>
          <p className="text-stone-500 mt-1">{reservations.length} reservas en total</p>
        </div>

        {reservations.length === 0 ? (
          <div className="bg-white rounded-3xl border border-stone-100 p-16 text-center">
            <p className="text-4xl mb-3">📋</p>
            <p className="text-slate-700 font-bold">Aún no hay reservas</p>
            <p className="text-stone-400 text-sm mt-1">Las reservas aparecerán aquí cuando los clientes reserven</p>
          </div>
        ) : (
          <div className="space-y-4">
            {reservations.map((res) => {
              const status = STATUS_CONFIG[res.status] ?? STATUS_CONFIG.PENDING;
              const nights = Math.ceil(
                (new Date(res.checkOut).getTime() - new Date(res.checkIn).getTime()) / (1000 * 60 * 60 * 24)
              );
              return (
                <div key={res.id} className="bg-white rounded-2xl border border-stone-100 p-6 shadow-sm">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-sm font-bold text-slate-600">
                          {res.user.name?.charAt(0).toUpperCase() ?? "U"}
                        </div>
                        <p className="font-bold text-slate-900">{res.user.name ?? res.user.email}</p>
                      </div>
                      <p className="text-xs text-stone-400">{res.user.email}</p>
                    </div>
                    <span className={`text-xs font-bold px-3 py-1.5 rounded-full ${status.bg} ${status.text}`}>
                      {status.label}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                    <div className="bg-stone-50 rounded-xl p-3">
                      <p className="text-xs text-stone-400 uppercase tracking-wider">Check-in</p>
                      <p className="text-sm font-bold text-slate-900 mt-0.5">
                        {new Date(res.checkIn).toLocaleDateString("es-CL")}
                      </p>
                    </div>
                    <div className="bg-stone-50 rounded-xl p-3">
                      <p className="text-xs text-stone-400 uppercase tracking-wider">Check-out</p>
                      <p className="text-sm font-bold text-slate-900 mt-0.5">
                        {new Date(res.checkOut).toLocaleDateString("es-CL")}
                      </p>
                    </div>
                    <div className="bg-stone-50 rounded-xl p-3">
                      <p className="text-xs text-stone-400 uppercase tracking-wider">Huéspedes</p>
                      <p className="text-sm font-bold text-slate-900 mt-0.5">{res.guests} · {nights} noches</p>
                    </div>
                    <div className="bg-stone-50 rounded-xl p-3">
                      <p className="text-xs text-stone-400 uppercase tracking-wider">Total</p>
                      <p className="text-sm font-bold text-slate-900 mt-0.5">${res.totalPrice.toLocaleString()}</p>
                    </div>
                  </div>

                  {res.extras.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {res.extras.map((e, i) => (
                        <span key={i} className="text-xs bg-teal-50 text-teal-700 px-2.5 py-1 rounded-full font-medium">
                          {e.type} ×{e.quantity}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Acciones */}
                  {res.status === "PENDING" && (
                    <div className="flex gap-2 pt-4 border-t border-stone-100">
                      <button
                        onClick={() => updateStatus(res.id, "CONFIRMED")}
                        className="flex-1 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold py-2.5 rounded-xl transition-colors"
                      >
                        ✓ Confirmar reserva
                      </button>
                      <button
                        onClick={() => updateStatus(res.id, "CANCELLED")}
                        className="flex-1 bg-rose-50 hover:bg-rose-100 text-rose-600 text-xs font-bold py-2.5 rounded-xl transition-colors border border-rose-200"
                      >
                        ✕ Rechazar reserva
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
