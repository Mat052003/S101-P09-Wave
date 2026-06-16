"use client";
// app/components/ReviewForm.tsx
// Formulario para crear reseña — se usa desde el dashboard

import { useState } from "react";
import { useRouter } from "next/navigation";
import StarRating from "./StarRating";

interface Props {
  reservationId: string;
  hotelName: string;
  onClose: () => void;
}

export default function ReviewForm({ reservationId, hotelName, onClose }: Props) {
  const router = useRouter();
  const [cleanliness, setCleanliness] = useState(5);
  const [location, setLocation]       = useState(5);
  const [service, setService]         = useState(5);
  const [comment, setComment]         = useState("");
  const [submitting, setSubmitting]   = useState(false);
  const [error, setError]             = useState("");
  const [success, setSuccess]         = useState(false);

  const avgRating = Math.round((cleanliness + location + service) / 3);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (comment.trim().length < 10) {
      setError("El comentario debe tener al menos 10 caracteres");
      return;
    }

    setSubmitting(true); setError("");

    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        reservationId, cleanliness, location, service, comment,
      }),
    });

    setSubmitting(false);

    if (!res.ok) {
      const data = await res.json();
      setError(data.error || "Error al enviar reseña");
      return;
    }

    setSuccess(true);
    setTimeout(() => { onClose(); router.refresh(); }, 1500);
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-[#F4F9E9] rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto shadow-2xl">

        <div className="p-6 md:p-8">
          {success ? (
            <div className="text-center py-8">
              <div className="text-5xl mb-3">✅</div>
              <h2 className="text-2xl font-display font-semibold text-[#153243]">¡Gracias por tu reseña!</h2>
              <p className="text-sm text-[#284B63] mt-2">Tu opinión ayuda a otros viajeros</p>
            </div>
          ) : (
            <>
              <div className="mb-6">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#284B63] mb-2">Nueva reseña</p>
                <h2 className="font-display text-2xl font-semibold text-[#153243]">{hotelName}</h2>
                <p className="text-sm text-[#284B63]/85 mt-1">Cuéntanos sobre tu experiencia</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Rating promedio visual */}
                <div className="bg-white border border-[#153243]/15 rounded-2xl p-4 text-center">
                  <p className="text-xs text-[#284B63]/75 uppercase tracking-wider font-bold mb-1">Calificación general</p>
                  <p className="text-4xl font-display font-bold text-[#153243]">{avgRating}.0</p>
                  <StarRating value={avgRating} readOnly size="md" />
                </div>

                {/* Categorías */}
                {[
                  { label: "Limpieza",  value: cleanliness, set: setCleanliness },
                  { label: "Ubicación", value: location,    set: setLocation },
                  { label: "Servicio",  value: service,     set: setService },
                ].map((cat) => (
                  <div key={cat.label} className="bg-white border border-[#153243]/15 rounded-xl p-4 flex items-center justify-between">
                    <span className="font-semibold text-[#153243] text-sm">{cat.label}</span>
                    <StarRating value={cat.value} onChange={cat.set} size="md" />
                  </div>
                ))}

                {/* Comentario */}
                <div>
                  <label className="block text-xs font-bold text-[#284B63] mb-2 uppercase tracking-wider">
                    Tu comentario *
                  </label>
                  <textarea
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Describe tu estadía: ¿qué te gustó? ¿qué mejorarías?"
                    rows={4}
                    required
                    minLength={10}
                    className="w-full bg-white border border-[#153243]/15 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#284B63] focus:ring-4 focus:ring-[#284B63]/20 transition-all resize-none"
                  />
                  <p className="text-xs text-[#284B63]/60 mt-1">{comment.length}/500 caracteres</p>
                </div>

                {error && (
                  <div className="bg-rose-50 border border-rose-200 rounded-xl px-4 py-3">
                    <p className="text-xs text-rose-600 font-medium">{error}</p>
                  </div>
                )}

                <div className="flex gap-3 pt-2">
                  <button type="button" onClick={onClose}
                    className="flex-1 bg-[#EEF0EB] hover:bg-stone-200 text-[#153243] font-bold py-3 rounded-2xl transition-colors text-sm">
                    Cancelar
                  </button>
                  <button type="submit" disabled={submitting}
                    className="flex-1 bg-[#284B63] hover:bg-[#153243] disabled:bg-stone-300 text-[#F4F9E9] font-bold py-3 rounded-2xl transition-colors text-sm">
                    {submitting ? "Publicando..." : "Publicar reseña"}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
