"use client";
// app/dashboard/reservations/[id]/page.tsx

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import ReviewForm from "@/app/components/ReviewForm";

type Extra = {
  id: string;
  type: string;
  price: number;
  quantity: number;
};

type Reservation = {
  id: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  totalPrice: number;
  status: string;
  createdAt: string;
  extras: Extra[];
  hotel: {
    id: string;
    name: string;
    location: string;
    stars: number;
    price: number;
    images: string[];
    experienceType: string;
  };
  review: { id: string } | null;
};

const EXTRA_LABELS: Record<string, string> = {
  BREAKFAST:  "🥐 Desayuno premium",
  SPA:        "💆 Sesión de spa",
  TOUR:       "🗺️ Tour guiado",
  TRANSPORT:  "🚗 Transporte privado",
};

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string; dot: string }> = {
  PENDING:   { label: "Pendiente",  bg: "bg-amber-50",  text: "text-amber-700",  dot: "bg-amber-400"  },
  CONFIRMED: { label: "Confirmada", bg: "bg-teal-50",   text: "text-teal-700",   dot: "bg-teal-400"   },
  CANCELLED: { label: "Cancelada",  bg: "bg-rose-50",   text: "text-rose-700",   dot: "bg-rose-400"   },
};

const EXPERIENCE_FALLBACK: Record<string, string> = {
  RELAX:       "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800&q=80",
  WELLNESS:    "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&q=80",
  GASTRONOMIC: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80",
  ADVENTURE:   "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=800&q=80",
  ROMANTIC:    "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80",
  CULTURAL:    "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80",
};

export default function ReservationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const reservationId = params.id as string;

  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [loading, setLoading]         = useState(true);
  const [cancelling, setCancelling]   = useState(false);
  const [cancelInfo, setCancelInfo]   = useState<{ refundPercent: number; refundAmount: number; daysUntil: number } | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [error, setError]             = useState("");
  const [cancelled, setCancelled]     = useState(false);

  useEffect(() => {
    fetch("/api/reservations")
      .then((r) => r.json())
      .then((data: Reservation[]) => {
        const res = data.find((r) => r.id === reservationId);
        setReservation(res || null);
        setLoading(false);
      });
  }, [reservationId]);

  // Calcular información de cancelación
  useEffect(() => {
    if (!reservation) return;
    const now       = new Date();
    const checkIn   = new Date(reservation.checkIn);
    const daysUntil = Math.ceil((checkIn.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (daysUntil > 7) {
      setCancelInfo({ refundPercent: 100, refundAmount: reservation.totalPrice, daysUntil });
    } else if (daysUntil >= 3) {
      setCancelInfo({ refundPercent: 50, refundAmount: reservation.totalPrice * 0.5, daysUntil });
    } else {
      setCancelInfo(null); // no cancelable
    }
  }, [reservation]);

  async function handleCancel() {
    setCancelling(true); setError("");

    const res = await fetch(`/api/reservations/${reservationId}/cancel`, {
      method: "POST",
    });

    const data = await res.json();
    setCancelling(false);

    if (!res.ok) {
      setError(data.error || "Error al cancelar");
      setShowConfirm(false);
      return;
    }

    setCancelled(true);
    setShowConfirm(false);
    setReservation((prev) => prev ? { ...prev, status: "CANCELLED" } : prev);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#EEF0EB] flex items-center justify-center">
        <p className="text-[#284B63]">Cargando reserva...</p>
      </div>
    );
  }

  if (!reservation) {
    return (
      <div className="min-h-screen bg-[#EEF0EB] flex items-center justify-center">
        <p className="text-[#284B63]">Reserva no encontrada</p>
      </div>
    );
  }

  const status    = STATUS_CONFIG[reservation.status] ?? STATUS_CONFIG.PENDING;
  const nights    = Math.ceil((new Date(reservation.checkOut).getTime() - new Date(reservation.checkIn).getTime()) / (1000 * 60 * 60 * 24));
  const hotelImg  = reservation.hotel.images?.[0] || EXPERIENCE_FALLBACK[reservation.hotel.experienceType] || EXPERIENCE_FALLBACK.RELAX;
  const isPast    = new Date(reservation.checkOut) < new Date();
  const canReview = reservation.status === "CONFIRMED" && isPast && !reservation.review;
  const canCancel = reservation.status !== "CANCELLED" && !isPast && cancelInfo !== null;

  return (
    <div className="min-h-screen bg-[#EEF0EB] text-[#153243]">

      {/* Modal confirmación cancelación */}
      {showConfirm && cancelInfo && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#F4F9E9] rounded-3xl max-w-md w-full p-8 shadow-2xl">
            <h2 className="font-display text-2xl font-semibold text-[#153243] mb-2">¿Confirmar cancelación?</h2>
            <p className="text-sm text-[#284B63] mb-6">
              Faltan <strong>{cancelInfo.daysUntil} días</strong> para tu check-in.
            </p>

            <div className={`rounded-2xl p-4 mb-6 ${
              cancelInfo.refundPercent === 100 ? "bg-teal-50 border border-teal-200" : "bg-amber-50 border border-amber-200"
            }`}>
              <p className={`text-sm font-bold mb-1 ${cancelInfo.refundPercent === 100 ? "text-teal-700" : "text-amber-700"}`}>
                {cancelInfo.refundPercent === 100 ? "✅ Cancelación gratuita" : "⚠️ Cancelación con cargo"}
              </p>
              <p className="text-sm text-[#153243]">
                Reembolso: <strong>${cancelInfo.refundAmount.toLocaleString()}</strong> ({cancelInfo.refundPercent}% del total)
              </p>
              {cancelInfo.refundPercent < 100 && (
                <p className="text-xs text-[#284B63]/75 mt-1">
                  Cargo por cancelación tardía: ${(reservation.totalPrice - cancelInfo.refundAmount).toLocaleString()}
                </p>
              )}
            </div>

            {error && <p className="text-xs text-rose-600 mb-4 font-medium">{error}</p>}

            <div className="flex gap-3">
              <button onClick={() => setShowConfirm(false)}
                className="flex-1 bg-[#EEF0EB] hover:bg-stone-200 text-[#153243] font-bold py-3 rounded-2xl transition-colors text-sm">
                Volver
              </button>
              <button onClick={handleCancel} disabled={cancelling}
                className="flex-1 bg-rose-500 hover:bg-rose-600 disabled:bg-stone-300 text-white font-bold py-3 rounded-2xl transition-colors text-sm">
                {cancelling ? "Cancelando..." : "Sí, cancelar reserva"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal reseña */}
      {showReviewForm && (
        <ReviewForm
          reservationId={reservation.id}
          hotelName={reservation.hotel.name}
          onClose={() => setShowReviewForm(false)}
        />
      )}

      <div className="max-w-3xl mx-auto px-6 py-10 space-y-6">

        <div className="flex items-center justify-between">
          <Link href="/dashboard" className="text-sm text-[#284B63] hover:text-[#153243] font-semibold">
            ← Volver al dashboard
          </Link>
          <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full ${status.bg} ${status.text}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
            {status.label}
          </span>
        </div>

        {/* Hotel */}
        <div className="bg-[#F4F9E9] border border-[#153243]/15 rounded-3xl overflow-hidden shadow-sm">
          <div className="aspect-[21/9] overflow-hidden">
            <img src={hotelImg} alt={reservation.hotel.name} className="w-full h-full object-cover" />
          </div>
          <div className="p-6">
            <h1 className="font-display text-3xl font-semibold text-[#153243]">{reservation.hotel.name}</h1>
            <p className="text-[#284B63] mt-1">📍 {reservation.hotel.location}</p>
            <div className="flex gap-1 mt-2">
              {[...Array(reservation.hotel.stars)].map((_, i) => (
                <span key={i} className="text-amber-400">★</span>
              ))}
            </div>
          </div>
        </div>

        {/* Detalles */}
        <div className="bg-[#F4F9E9] border border-[#153243]/15 rounded-3xl p-6 shadow-sm space-y-4">
          <h2 className="font-display text-xl font-semibold text-[#153243]">Detalles de la reserva</h2>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-[#284B63]/75 mb-1">Check-in</p>
              <p className="font-bold text-[#153243]">
                {new Date(reservation.checkIn).toLocaleDateString("es-CL", { weekday: "long", day: "numeric", month: "long" })}
              </p>
            </div>
            <div className="bg-white rounded-2xl p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-[#284B63]/75 mb-1">Check-out</p>
              <p className="font-bold text-[#153243]">
                {new Date(reservation.checkOut).toLocaleDateString("es-CL", { weekday: "long", day: "numeric", month: "long" })}
              </p>
            </div>
            <div className="bg-white rounded-2xl p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-[#284B63]/75 mb-1">Huéspedes</p>
              <p className="font-bold text-[#153243]">{reservation.guests} {reservation.guests === 1 ? "persona" : "personas"}</p>
            </div>
            <div className="bg-white rounded-2xl p-4">
              <p className="text-xs font-bold uppercase tracking-wider text-[#284B63]/75 mb-1">Noches</p>
              <p className="font-bold text-[#153243]">{nights}</p>
            </div>
          </div>

          {/* Extras */}
          {reservation.extras.length > 0 && (
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-[#284B63]/75 mb-3">Experiencias adicionales</p>
              <div className="space-y-2">
                {reservation.extras.map((extra) => (
                  <div key={extra.id} className="flex items-center justify-between bg-white rounded-xl px-4 py-3">
                    <span className="text-sm text-[#153243] font-medium">{EXTRA_LABELS[extra.type] ?? extra.type}</span>
                    <span className="text-sm font-bold text-[#153243]">${(extra.price * extra.quantity).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Total */}
          <div className="flex items-center justify-between pt-4 border-t border-[#153243]/10">
            <span className="font-black text-[#153243] text-lg">Total pagado</span>
            <span className="font-black text-[#153243] text-2xl">${reservation.totalPrice.toLocaleString()}</span>
          </div>
        </div>

        {/* Política de cancelación */}
        {reservation.status !== "CANCELLED" && !isPast && (
          <div className="bg-[#F4F9E9] border border-[#153243]/15 rounded-3xl p-6 shadow-sm">
            <h2 className="font-display text-xl font-semibold text-[#153243] mb-4">Política de cancelación</h2>
            <div className="space-y-2">
              {[
                { label: "Más de 7 días antes",  policy: "Cancelación gratuita (100% reembolso)",   color: "text-teal-600"  },
                { label: "Entre 3 y 7 días",      policy: "Cargo del 50% del total",                 color: "text-amber-600" },
                { label: "Menos de 3 días",       policy: "No cancelable",                           color: "text-rose-600"  },
              ].map((row) => (
                <div key={row.label} className="flex items-center justify-between bg-white rounded-xl px-4 py-3">
                  <span className="text-sm font-medium text-[#153243]">{row.label}</span>
                  <span className={`text-xs font-bold ${row.color}`}>{row.policy}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Acciones */}
        <div className="flex flex-col gap-3">
          {/* Botón cancelar */}
          {canCancel && !cancelled && (
            <button
              onClick={() => setShowConfirm(true)}
              className="w-full bg-rose-50 hover:bg-rose-100 border-2 border-rose-300 text-rose-600 font-bold py-3.5 rounded-2xl transition-colors text-sm"
            >
              Cancelar reserva
            </button>
          )}

          {/* No cancelable */}
          {reservation.status !== "CANCELLED" && !isPast && cancelInfo === null && (
            <div className="bg-rose-50 border border-rose-200 rounded-2xl px-4 py-3 text-center">
              <p className="text-sm text-rose-600 font-medium">Esta reserva ya no se puede cancelar (menos de 3 días)</p>
            </div>
          )}

          {/* Dejar reseña */}
          {canReview && (
            <button
              onClick={() => setShowReviewForm(true)}
              className="w-full bg-[#284B63] hover:bg-[#153243] text-[#F4F9E9] font-bold py-3.5 rounded-2xl transition-colors text-sm"
            >
              ⭐ Dejar reseña
            </button>
          )}

          {/* Ya dejó reseña */}
          {reservation.review && (
            <div className="bg-teal-50 border border-teal-200 rounded-2xl px-4 py-3 text-center">
              <p className="text-sm text-teal-600 font-medium">✅ Ya dejaste una reseña para esta estadía</p>
            </div>
          )}

          {/* Ver hotel */}
          <Link
            href={`/hotels/${reservation.hotel.id}`}
            className="w-full text-center bg-[#EEF0EB] hover:bg-[#F4F9E9] border-2 border-[#153243]/15 text-[#153243] font-bold py-3.5 rounded-2xl transition-colors text-sm"
          >
            Ver página del hotel
          </Link>
        </div>
      </div>
    </div>
  );
}
