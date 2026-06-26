"use client";
// app/components/HotelReviews.tsx

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import StarRating from "./StarRating";

interface Props {
  hotelId: string;
  isOwner?: boolean;
}

// ── Strict types (no any) ───────────────────────────────────────
interface LocalReview {
  id: string;
  rating: number;
  cleanliness: number;
  location: number;
  service: number;
  comment: string;
  ownerReply?: string | null;
  ownerReplyAt?: string | null;
  createdAt: string;
  isGoogle: false;
  user: { name: string | null; image: string | null };
}

interface GoogleReview {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  isGoogle: true;
  user: { name: string | null; image: string | null };
}

type Review = LocalReview | GoogleReview;

interface Stats {
  total: number;
  avgRating: number;
  avgCleanliness: number;
  avgLocation: number;
  avgService: number;
  googleRating?: number;
  googleTotalReviews?: number;
}

// ── Avatar helper ───────────────────────────────────────────────
function Avatar({ name, image }: { name: string | null; image: string | null }) {
  const [imgError, setImgError] = useState(false);

  if (image && !imgError) {
    return (
      <img
        src={image}
        alt={name ?? "User"}
        className="w-10 h-10 rounded-full object-cover"
        referrerPolicy="no-referrer"
        onError={() => setImgError(true)}
      />
    );
  }
  return (
    <div className="w-10 h-10 rounded-full bg-[#284B63] flex items-center justify-center text-[#F4F9E9] text-sm font-bold shrink-0">
      {name?.charAt(0).toUpperCase() ?? "U"}
    </div>
  );
}

// ── Local review card ───────────────────────────────────────────
function LocalReviewCard({
  review,
  isOwner,
  onReply,
  onReport,
  t,
}: {
  review: LocalReview;
  isOwner?: boolean;
  onReply: (id: string, text: string) => Promise<void>;
  onReport: (id: string, reason: string) => Promise<void>;
  t: ReturnType<typeof useTranslations<"hotelDetail.reviews">>;
}) {
  const [replyingTo, setReplyingTo] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [reporting, setReporting] = useState(false);
  const [reportReason, setReportReason] = useState("");

  return (
    <article className="bg-[#EEF0EB] border border-[#153243]/15 rounded-2xl p-4 sm:p-6">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex items-center gap-3 min-w-0">
          <Avatar name={review.user.name} image={review.user.image} />
          <div className="min-w-0">
            <p className="font-bold text-[#153243] text-sm truncate">{review.user.name ?? "User"}</p>
            <p className="text-xs text-[#284B63]/75">
              {new Date(review.createdAt).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}
            </p>
          </div>
        </div>
        <StarRating value={review.rating} readOnly size="sm" />
      </div>

      {/* Sub-ratings */}
      <div className="grid grid-cols-3 gap-2 mb-4 text-xs">
        {[
          { label: t("cleanliness"), value: review.cleanliness },
          { label: t("locationLabel"), value: review.location },
          { label: t("service"), value: review.service },
        ].map((cat) => (
          <div key={cat.label} className="bg-[#F4F9E9] rounded-lg px-2 py-2 text-center">
            <p className="text-[#284B63]/75 font-semibold uppercase tracking-wider text-[9px]">{cat.label}</p>
            <p className="text-[#153243] font-bold mt-0.5">{cat.value}/5</p>
          </div>
        ))}
      </div>

      <p className="text-[#284B63] leading-relaxed text-sm">{review.comment}</p>

      {/* Owner reply */}
      {review.ownerReply && (
        <div className="mt-4 pl-4 border-l-4 border-[#284B63] bg-[#F4F9E9] rounded-r-lg p-3">
          <p className="text-xs font-bold text-[#284B63] uppercase tracking-wider mb-1">🏨 {t("hostReply")}</p>
          <p className="text-sm text-[#153243]">{review.ownerReply}</p>
          {review.ownerReplyAt && (
            <p className="text-xs text-[#284B63]/60 mt-1">
              {new Date(review.ownerReplyAt).toLocaleDateString()}
            </p>
          )}
        </div>
      )}

      {/* Owner actions */}
      {isOwner && (
        <div className="mt-4 pt-4 border-t border-[#153243]/10">
          {replyingTo ? (
            <div className="space-y-2">
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder={t("writeReply")}
                rows={3}
                className="w-full bg-white border border-[#153243]/15 rounded-xl px-3 py-2 text-sm outline-none focus:border-[#284B63] resize-none"
              />
              <div className="flex gap-2 justify-end">
                <button onClick={() => { setReplyingTo(false); setReplyText(""); }}
                  className="text-xs text-[#284B63] hover:text-[#153243] font-semibold px-3 py-1.5">
                  {t("cancel")}
                </button>
                <button onClick={async () => { await onReply(review.id, replyText); setReplyingTo(false); setReplyText(""); }}
                  disabled={replyText.trim().length < 3}
                  className="text-xs bg-[#284B63] hover:bg-[#153243] disabled:bg-stone-300 text-[#F4F9E9] font-bold px-4 py-1.5 rounded-full transition-colors">
                  {t("postReply")}
                </button>
              </div>
            </div>
          ) : reporting ? (
            <div className="space-y-2">
              <textarea
                value={reportReason}
                onChange={(e) => setReportReason(e.target.value)}
                placeholder={t("reportReason")}
                rows={2}
                className="w-full bg-white border border-rose-300 rounded-xl px-3 py-2 text-sm outline-none focus:border-rose-500 resize-none"
              />
              <div className="flex gap-2 justify-end">
                <button onClick={() => { setReporting(false); setReportReason(""); }}
                  className="text-xs text-[#284B63] hover:text-[#153243] font-semibold px-3 py-1.5">
                  {t("cancel")}
                </button>
                <button onClick={async () => { await onReport(review.id, reportReason); setReporting(false); setReportReason(""); }}
                  disabled={reportReason.trim().length < 5}
                  className="text-xs bg-rose-500 hover:bg-rose-600 disabled:bg-stone-300 text-white font-bold px-4 py-1.5 rounded-full transition-colors">
                  {t("reportReview")}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex gap-3">
              {!review.ownerReply && (
                <button onClick={() => setReplyingTo(true)}
                  className="text-xs text-[#284B63] hover:text-[#153243] font-bold">
                  {t("reply")}
                </button>
              )}
              <button onClick={() => setReporting(true)}
                className="text-xs text-rose-500 hover:text-rose-600 font-bold">
                {t("report")}
              </button>
            </div>
          )}
        </div>
      )}
    </article>
  );
}

// ── Google review card ──────────────────────────────────────────
function GoogleReviewCard({ review }: { review: GoogleReview }) {
  return (
    <article className="bg-white border border-[#153243]/10 rounded-2xl p-4 sm:p-5">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex items-center gap-3 min-w-0">
          <Avatar name={review.user.name} image={review.user.image} />
          <div className="min-w-0">
            <p className="font-bold text-[#153243] text-sm flex items-center gap-2 flex-wrap">
              <span className="truncate">{review.user.name ?? "User"}</span>
              <span className="bg-white text-gray-500 text-[10px] px-1.5 py-0.5 rounded border border-gray-200 shrink-0">Google</span>
            </p>
            <p className="text-xs text-[#284B63]/75">
              {new Date(review.createdAt).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" })}
            </p>
          </div>
        </div>
        <StarRating value={review.rating} readOnly size="sm" />
      </div>
      <p className="text-[#284B63] leading-relaxed text-sm">{review.comment}</p>
    </article>
  );
}

import { useRouter } from "@/i18n/navigation";
import ReviewForm from "./ReviewForm";

// ── Main component ──────────────────────────────────────────────
export default function HotelReviews({ hotelId, isOwner }: Props) {
  const { data: session } = useSession();
  const router = useRouter();
  const [allReviews, setAllReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  
  // States for writing local reviews from hotel page
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [eligibleReservationId, setEligibleReservationId] = useState<string | null>(null);
  const [checkingEligibility, setCheckingEligibility] = useState(false);

  const t = useTranslations("hotelDetail.reviews");

  function loadReviews() {
    fetch(`/api/hotels/${hotelId}/reviews`)
      .then((r) => r.json())
      .then((data) => {
        setAllReviews(data.reviews ?? []);
        setStats(data.stats);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }

  useEffect(() => { loadReviews(); }, [hotelId]);

  async function submitReply(reviewId: string, text: string) {
    const res = await fetch(`/api/reviews/${reviewId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ownerReply: text }),
    });
    if (res.ok) loadReviews();
  }

  const [cleanliness, setCleanliness] = useState(5);
  const [location, setLocation] = useState(5);
  const [service, setService] = useState(5);
  const [comment, setComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState("");

  async function submitReport(reviewId: string, reason: string) {
    const res = await fetch(`/api/reviews/${reviewId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reason }),
    });
    if (res.ok) {
      alert(t("reportSuccess"));
    } else {
      alert(t("reportError"));
    }
  }

  async function handleWriteReviewClick() {
    if (!session?.user) {
      router.push("/auth/login");
      return;
    }
    
    // Si es ADMIN, permitir reseña directamente (Modo de demostración)
    // También aceptamos al admin si tiene el isOwner prop
    if ((session.user as any).role === "ADMIN" || isOwner) {
      setEligibleReservationId(null);
      setShowReviewForm(true);
      return;
    }

    setCheckingEligibility(true);
    try {
      const res = await fetch("/api/reservations");
      const data = await res.json();
      const eligible = data.find((r: any) => 
        r.hotel.id === hotelId && 
        r.status === "CONFIRMED" && 
        new Date(r.checkOut) < new Date() && 
        !r.review
      );
      if (eligible) {
        setEligibleReservationId(eligible.id);
        setShowReviewForm(true);
      } else {
        alert("Solo puedes dejar una reseña si tienes una reserva pasada y confirmada en este hotel que aún no hayas reseñado. (Los admins pueden probar directamente).");
      }
    } catch (e) {
      console.error(e);
      alert("Error al verificar tus reservas.");
    } finally {
      setCheckingEligibility(false);
    }
  }

  async function handleReviewSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (comment.trim().length < 10) {
      setReviewError("El comentario debe tener al menos 10 caracteres");
      return;
    }
    setSubmittingReview(true);
    setReviewError("");

    const payload: any = {
      cleanliness,
      location,
      service,
      comment,
      hotelId: eligibleReservationId ? undefined : hotelId, // Send hotelId if no reservation ID is provided (for admins)
      reservationId: eligibleReservationId,
    };

    const res = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    setSubmittingReview(false);

    if (res.ok) {
      setShowReviewForm(false);
      setComment("");
      loadReviews();
    } else {
      const data = await res.json();
      setReviewError(data.error || "Error al enviar reseña");
    }
  }

  const localReviews = allReviews.filter((r): r is LocalReview => !r.isGoogle);
  const googleReviews = allReviews.filter((r): r is GoogleReview => r.isGoogle);
  const hasGoogleData = (stats?.googleTotalReviews ?? 0) > 0;

  if (loading) return <p className="text-sm text-[#284B63]/70">{t("loading")}</p>;

  return (
    <section className="space-y-6 pt-6 border-t border-[#153243]/15">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h2 className="font-display text-2xl font-semibold text-[#153243]">{t("title")}</h2>
      </div>

      {showReviewForm && (
        <div className="bg-[#F4F9E9] border-2 border-[#153243]/20 rounded-3xl p-6 sm:p-8 mb-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#284B63] mb-1">Tu experiencia</p>
              <h3 className="font-display text-2xl font-semibold text-[#153243]">Califica tu estadía</h3>
            </div>
            <button onClick={() => setShowReviewForm(false)} className="text-[#284B63] hover:text-[#153243] text-sm font-bold">
              ✕ Cancelar
            </button>
          </div>

          <form onSubmit={handleReviewSubmit} className="space-y-6">
            <div className="grid sm:grid-cols-3 gap-4">
              {[
                { label: "Limpieza", value: cleanliness, set: setCleanliness },
                { label: "Ubicación", value: location, set: setLocation },
                { label: "Servicio", value: service, set: setService },
              ].map((cat) => (
                <div key={cat.label} className="bg-white border border-[#153243]/15 rounded-2xl p-4 flex flex-col items-center gap-2">
                  <span className="font-bold text-[#153243] text-sm">{cat.label}</span>
                  <StarRating value={cat.value} onChange={cat.set} size="md" />
                </div>
              ))}
            </div>

            <div>
              <label className="block text-xs font-bold text-[#284B63] mb-2 uppercase tracking-wider">Tu comentario</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="¿Qué fue lo que más te gustó? ¿Qué mejorarías?"
                rows={4}
                required
                minLength={10}
                className="w-full bg-white border border-[#153243]/15 rounded-2xl p-4 text-sm outline-none focus:border-[#284B63] focus:ring-4 focus:ring-[#284B63]/10 transition-all resize-none"
              />
            </div>

            {reviewError && <p className="text-xs text-rose-600 font-bold">{reviewError}</p>}

            <button type="submit" disabled={submittingReview}
              className="w-full bg-[#153243] hover:bg-[#284B63] disabled:bg-stone-400 text-white font-bold py-4 rounded-2xl transition-colors text-sm">
              {submittingReview ? "Publicando..." : "Publicar reseña"}
            </button>
          </form>
        </div>
      )}

      {/* Stats summary */}
      {stats && (stats.total > 0 || hasGoogleData) && (
        <div className="bg-[#F4F9E9] border border-[#153243]/15 rounded-2xl p-5 sm:p-6 grid md:grid-cols-2 gap-6">
          {/* Local stats */}
          <div className="flex flex-col items-center justify-center text-center md:border-r md:border-[#153243]/15">
            {stats.total > 0 ? (
              <>
                <p className="text-xs font-semibold uppercase tracking-wider text-[#284B63]/70 mb-2">{t("localReviews")}</p>
                <p className="text-5xl font-display font-bold text-[#153243]">{stats.avgRating.toFixed(1)}</p>
                <StarRating value={Math.round(stats.avgRating)} readOnly size="md" />
                <p className="text-xs text-[#284B63]/75 mt-2">
                  {t("basedOn", { count: stats.total, entity: stats.total === 1 ? t("review") : t("reviews") })}
                </p>
              </>
            ) : (
              <p className="text-sm text-[#284B63]/75">{t("noLocalReviews")}</p>
            )}
          </div>

          {/* Google stats */}
          <div className="flex flex-col items-center justify-center text-center">
            {hasGoogleData ? (
              <>
                <p className="text-xs font-semibold uppercase tracking-wider text-[#284B63]/70 mb-2">{t("googleReviews")}</p>
                <p className="text-5xl font-display font-bold text-[#153243]">{stats.googleRating?.toFixed(1)}</p>
                <StarRating value={Math.round(stats.googleRating ?? 0)} readOnly size="md" />
                <p className="text-sm font-semibold text-[#284B63]/75 mt-2">{t("googleCount", { count: stats.googleTotalReviews ?? 0 })}</p>
              </>
            ) : (
              <p className="text-sm text-[#284B63]/75">No Google data</p>
            )}
          </div>

          {/* Sub-ratings (local) */}
          {stats.total > 0 && (
            <div className="md:col-span-2 grid grid-cols-3 gap-4 pt-4 border-t border-[#153243]/10">
              {[
                { label: t("cleanliness"), value: stats.avgCleanliness },
                { label: t("locationLabel"), value: stats.avgLocation },
                { label: t("service"), value: stats.avgService },
              ].map((cat) => (
                <div key={cat.label}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-semibold text-[#153243]">{cat.label}</span>
                    <span className="font-bold text-[#284B63]">{cat.value.toFixed(1)}</span>
                  </div>
                  <div className="h-2 bg-white rounded-full overflow-hidden">
                    <div className="h-full bg-[#284B63] transition-all" style={{ width: `${(cat.value / 5) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Dual panel: Local | Google */}
      {localReviews.length === 0 && googleReviews.length === 0 ? (
        <div className="bg-[#EEF0EB] border border-[#153243]/15 rounded-2xl p-8 text-center">
          <p className="text-4xl mb-3">💬</p>
          <p className="text-[#153243] font-semibold">{t("noReviews")}</p>
          <p className="text-sm text-[#284B63]/75 mt-1 mb-4">{t("beFirst")}</p>
          {!showReviewForm && (
            <button
              onClick={handleWriteReviewClick}
              disabled={checkingEligibility}
              className="bg-[#284B63] hover:bg-[#153243] disabled:opacity-50 text-[#F4F9E9] text-sm font-bold px-6 py-2 rounded-xl transition-colors shadow-sm inline-block"
            >
              {checkingEligibility ? "Verificando..." : "Escribir Reseña"}
            </button>
          )}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Column 1 — Platform reviews */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-[0.15em] text-[#284B63]">{t("localReviews")}</h3>
              {!showReviewForm && (
                <button
                  onClick={handleWriteReviewClick}
                  disabled={checkingEligibility}
                  className="bg-[#284B63] hover:bg-[#153243] disabled:opacity-50 text-[#F4F9E9] text-xs font-bold px-4 py-2 rounded-lg transition-colors shadow-sm"
                >
                  {checkingEligibility ? "Verificando..." : "Escribir Reseña"}
                </button>
              )}
            </div>
            {localReviews.length === 0 ? (
              <div className="bg-[#EEF0EB] border border-[#153243]/15 rounded-2xl p-6 text-center">
                <p className="text-sm text-[#284B63]/60 italic mb-3">{t("noLocalReviews")}</p>
                {!showReviewForm && (
                  <button
                    onClick={handleWriteReviewClick}
                    disabled={checkingEligibility}
                    className="bg-[#284B63] hover:bg-[#153243] disabled:opacity-50 text-[#F4F9E9] text-xs font-bold px-4 py-2 rounded-lg transition-colors shadow-sm"
                  >
                    {checkingEligibility ? "Verificando..." : "Sé el primero"}
                  </button>
                )}
              </div>
            ) : (
              localReviews.map((review) => (
                <LocalReviewCard
                  key={review.id}
                  review={review}
                  isOwner={isOwner}
                  onReply={submitReply}
                  onReport={submitReport}
                  t={t}
                />
              ))
            )}
          </div>

          {/* Column 2 — Google reviews */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-[0.15em] text-[#284B63] flex items-center gap-2">
              {t("googleReviews")}
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            </h3>
            {googleReviews.length === 0 ? (
              <p className="text-sm text-[#284B63]/60 italic">No Google reviews linked</p>
            ) : (
              googleReviews.map((review) => (
                <GoogleReviewCard key={review.id} review={review} />
              ))
            )}
          </div>
        </div>
      )}
    </section>
  );
}
