"use client";
// app/components/HotelReviews.tsx

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import StarRating from "./StarRating";

interface Props {
  hotelId: string;
  isOwner?: boolean;
}

type Review = {
  id: string;
  rating: number;
  cleanliness: number;
  location: number;
  service: number;
  comment: string;
  ownerReply: string | null;
  ownerReplyAt: string | null;
  createdAt: string;
  user: { name: string | null; image: string | null };
};

type Stats = {
  total: number;
  avgRating: number;
  avgCleanliness: number;
  avgLocation: number;
  avgService: number;
};

export default function HotelReviews({ hotelId, isOwner }: Props) {
  const { data: session } = useSession();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats]     = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  // Estado para responder
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText]   = useState("");

  // Estado para reportar
  const [reportingId, setReportingId] = useState<string | null>(null);
  const [reportReason, setReportReason] = useState("");

  function loadReviews() {
    fetch(`/api/hotels/${hotelId}/reviews`)
      .then((r) => r.json())
      .then((data) => {
        setReviews(data.reviews || []);
        setStats(data.stats);
        setLoading(false);
      });
  }

  useEffect(() => { loadReviews(); }, [hotelId]);

  async function submitReply(reviewId: string) {
    const res = await fetch(`/api/reviews/${reviewId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ownerReply: replyText }),
    });
    if (res.ok) {
      setReplyingTo(null);
      setReplyText("");
      loadReviews();
    }
  }

  async function submitReport(reviewId: string) {
    const res = await fetch(`/api/reviews/${reviewId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason: reportReason }),
    });
    if (res.ok) {
      setReportingId(null);
      setReportReason("");
      alert("Reseña reportada. Gracias.");
    } else {
      alert("Error al reportar");
    }
  }

  if (loading) {
    return <p className="text-sm text-[#284B63]/70">Cargando reseñas...</p>;
  }

  return (
    <section className="space-y-6">
      <h2 className="font-display text-2xl font-semibold text-[#153243]">Reseñas de huéspedes</h2>

      {/* ── Estadísticas globales ──────────────────────────────── */}
      {stats && stats.total > 0 && (
        <div className="bg-[#F4F9E9] border border-[#153243]/15 rounded-2xl p-6 grid md:grid-cols-2 gap-6">
          <div className="flex flex-col items-center justify-center text-center md:border-r md:border-[#153243]/15">
            <p className="text-5xl font-display font-bold text-[#153243]">
              {stats.avgRating.toFixed(1)}
            </p>
            <StarRating value={Math.round(stats.avgRating)} readOnly size="md" />
            <p className="text-xs text-[#284B63]/75 mt-2">
              Basado en {stats.total} {stats.total === 1 ? "reseña" : "reseñas"}
            </p>
          </div>

          <div className="space-y-3">
            {[
              { label: "Limpieza",  value: stats.avgCleanliness },
              { label: "Ubicación", value: stats.avgLocation },
              { label: "Servicio",  value: stats.avgService },
            ].map((cat) => (
              <div key={cat.label}>
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-semibold text-[#153243]">{cat.label}</span>
                  <span className="font-bold text-[#284B63]">{cat.value.toFixed(1)}</span>
                </div>
                <div className="h-2 bg-white rounded-full overflow-hidden">
                  <div
                    className="h-full bg-[#284B63] transition-all"
                    style={{ width: `${(cat.value / 5) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Lista de reseñas ───────────────────────────────────── */}
      {reviews.length === 0 ? (
        <div className="bg-[#EEF0EB] border border-[#153243]/15 rounded-2xl p-8 text-center">
          <p className="text-4xl mb-3">💬</p>
          <p className="text-[#153243] font-semibold">Aún no hay reseñas</p>
          <p className="text-sm text-[#284B63]/75 mt-1">Sé el primero en compartir tu experiencia</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <article key={review.id} className="bg-[#EEF0EB] border border-[#153243]/15 rounded-2xl p-6">
              {/* Header */}
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#284B63] flex items-center justify-center text-[#F4F9E9] text-sm font-bold">
                    {review.user.name?.charAt(0).toUpperCase() ?? "U"}
                  </div>
                  <div>
                    <p className="font-bold text-[#153243] text-sm">{review.user.name ?? "Usuario"}</p>
                    <p className="text-xs text-[#284B63]/75">
                      {new Date(review.createdAt).toLocaleDateString("es-CL", {
                        year: "numeric", month: "long", day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
                <StarRating value={review.rating} readOnly size="sm" />
              </div>

              {/* Categorías */}
              <div className="grid grid-cols-3 gap-3 mb-4 text-xs">
                <div className="bg-[#F4F9E9] rounded-lg px-3 py-2">
                  <p className="text-[#284B63]/75 font-semibold uppercase tracking-wider text-[10px]">Limpieza</p>
                  <p className="text-[#153243] font-bold mt-0.5">{review.cleanliness}/5</p>
                </div>
                <div className="bg-[#F4F9E9] rounded-lg px-3 py-2">
                  <p className="text-[#284B63]/75 font-semibold uppercase tracking-wider text-[10px]">Ubicación</p>
                  <p className="text-[#153243] font-bold mt-0.5">{review.location}/5</p>
                </div>
                <div className="bg-[#F4F9E9] rounded-lg px-3 py-2">
                  <p className="text-[#284B63]/75 font-semibold uppercase tracking-wider text-[10px]">Servicio</p>
                  <p className="text-[#153243] font-bold mt-0.5">{review.service}/5</p>
                </div>
              </div>

              {/* Comentario */}
              <p className="text-[#284B63] leading-relaxed text-sm">{review.comment}</p>

              {/* Respuesta del anfitrión */}
              {review.ownerReply && (
                <div className="mt-4 pl-4 border-l-4 border-[#284B63] bg-[#F4F9E9] rounded-r-lg p-3">
                  <p className="text-xs font-bold text-[#284B63] uppercase tracking-wider mb-1">
                    🏨 Respuesta del anfitrión
                  </p>
                  <p className="text-sm text-[#153243]">{review.ownerReply}</p>
                  {review.ownerReplyAt && (
                    <p className="text-xs text-[#284B63]/60 mt-1">
                      {new Date(review.ownerReplyAt).toLocaleDateString("es-CL")}
                    </p>
                  )}
                </div>
              )}

              {/* Acciones del anfitrión */}
              {isOwner && (
                <div className="mt-4 pt-4 border-t border-[#153243]/10">
                  {replyingTo === review.id ? (
                    <div className="space-y-2">
                      <textarea
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Escribe tu respuesta..."
                        rows={3}
                        className="w-full bg-white border border-[#153243]/15 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#284B63] resize-none"
                      />
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => { setReplyingTo(null); setReplyText(""); }}
                          className="text-xs text-[#284B63] hover:text-[#153243] font-semibold px-3 py-1.5"
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={() => submitReply(review.id)}
                          disabled={replyText.trim().length < 3}
                          className="text-xs bg-[#284B63] hover:bg-[#153243] disabled:bg-stone-300 text-[#F4F9E9] font-bold px-4 py-1.5 rounded-full transition-colors"
                        >
                          Publicar respuesta
                        </button>
                      </div>
                    </div>
                  ) : reportingId === review.id ? (
                    <div className="space-y-2">
                      <textarea
                        value={reportReason}
                        onChange={(e) => setReportReason(e.target.value)}
                        placeholder="¿Por qué reportas esta reseña? (ej: contenido falso, ofensivo, spam...)"
                        rows={2}
                        className="w-full bg-white border border-rose-300 rounded-xl px-3 py-2 text-sm outline-none focus:border-rose-500 resize-none"
                      />
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => { setReportingId(null); setReportReason(""); }}
                          className="text-xs text-[#284B63] hover:text-[#153243] font-semibold px-3 py-1.5"
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={() => submitReport(review.id)}
                          disabled={reportReason.trim().length < 5}
                          className="text-xs bg-rose-500 hover:bg-rose-600 disabled:bg-stone-300 text-white font-bold px-4 py-1.5 rounded-full transition-colors"
                        >
                          Reportar reseña
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-3">
                      {!review.ownerReply && (
                        <button
                          onClick={() => setReplyingTo(review.id)}
                          className="text-xs text-[#284B63] hover:text-[#153243] font-bold"
                        >
                          💬 Responder
                        </button>
                      )}
                      <button
                        onClick={() => setReportingId(review.id)}
                        className="text-xs text-rose-500 hover:text-rose-600 font-bold"
                      >
                        🚩 Reportar
                      </button>
                    </div>
                  )}
                </div>
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
