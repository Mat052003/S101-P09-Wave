"use client";
// app/hotels/[id]/page.tsx

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import HotelReviews from "@/app/components/HotelReviews";
import GoogleMapComponent from "@/app/components/GoogleMap";

type ExperienceType = "RELAX" | "WELLNESS" | "GASTRONOMIC" | "ADVENTURE" | "ROMANTIC" | "CULTURAL";

type Hotel = {
  id: string;
  name: string;
  description: string;
  location: string;
  experienceType: ExperienceType;
  price: number;
  stars: number;
  services: string[];
  exclusiveFeatures: string[];
  images: string[];
  latitude?: number;
  longitude?: number;
};

const EXPERIENCE_LABELS: Record<ExperienceType, string> = {
  RELAX: "Relax", WELLNESS: "Wellness", GASTRONOMIC: "Gastronomic",
  ADVENTURE: "Adventure", ROMANTIC: "Romantic", CULTURAL: "Cultural",
};

const EXPERIENCE_IMAGES: Record<ExperienceType, string[]> = {
  RELAX: [
    "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=1200&q=85",
    "https://images.unsplash.com/photo-1540541338287-41700207dee6?w=1200&q=85",
    "https://images.unsplash.com/photo-1582719508461-905c673771fd?w=1200&q=85",
    "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=1200&q=85",
  ],
  WELLNESS: [
    "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=1200&q=85",
    "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=1200&q=85",
    "https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=1200&q=85",
    "https://images.unsplash.com/photo-1591343395082-e120087004b4?w=1200&q=85",
  ],
  GASTRONOMIC: [
    "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1200&q=85",
    "https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=1200&q=85",
    "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1200&q=85",
    "https://images.unsplash.com/photo-1551218808-94e220e084d2?w=1200&q=85",
  ],
  ADVENTURE: [
    "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=1200&q=85",
    "https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=1200&q=85",
    "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1200&q=85",
    "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200&q=85",
  ],
  ROMANTIC: [
    "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=1200&q=85",
    "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=1200&q=85",
    "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=1200&q=85",
    "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=1200&q=85",
  ],
  CULTURAL: [
    "https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=1200&q=85",
    "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=1200&q=85",
    "https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=1200&q=85",
    "https://images.unsplash.com/photo-1549294413-26f195200c16?w=1200&q=85",
  ],
};

export default function HotelDetailPage() {
  const params = useParams();
  const hotelId = params.id as string;

  const [hotel, setHotel] = useState<Hotel | null>(null);
  const [loading, setLoading] = useState(true);
  const [mainImage, setMainImage] = useState(0);

  useEffect(() => {
    fetch(`/api/hotels/${hotelId}`)
      .then((r) => r.json())
      .then((data) => { setHotel(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [hotelId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#EEF0EB] flex items-center justify-center">
        <p className="text-[#284B63]">Cargando hotel...</p>
      </div>
    );
  }

  if (!hotel) {
    return (
      <div className="min-h-screen bg-[#EEF0EB] flex items-center justify-center">
        <p className="text-[#284B63]">Hotel no encontrado</p>
      </div>
    );
  }

  const images = hotel.images?.length > 0
    ? hotel.images
    : EXPERIENCE_IMAGES[hotel.experienceType] || EXPERIENCE_IMAGES.RELAX;

  return (
    <div className="min-h-screen bg-[#EEF0EB] text-[#153243]">
      <nav className="bg-[#F4F9E9] border-b border-[#153243]/15 px-6 h-16 flex items-center justify-between sticky top-0 z-10">
        <Link href="/hotels" className="flex items-center gap-2 text-[#153243] font-semibold">
          ← Volver a hoteles
        </Link>
        <Link href="/dashboard" className="text-sm text-[#284B63] hover:text-[#153243] transition-colors">
          Mi perfil
        </Link>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-8">

        {/* ── Galería ─────────────────────────────────────────────── */}
        <section className="mb-8">
          <div className="aspect-[16/9] rounded-3xl overflow-hidden bg-[#284B63]/10 mb-3">
            <img
              src={images[mainImage]}
              alt={hotel.name}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="grid grid-cols-4 gap-3">
            {images.slice(0, 4).map((img, i) => (
              <button
                key={i}
                onClick={() => setMainImage(i)}
                className={`aspect-[4/3] rounded-2xl overflow-hidden border-2 transition-all ${mainImage === i ? "border-[#153243] shadow-lg" : "border-transparent opacity-70 hover:opacity-100"
                  }`}
              >
                <img src={img} alt={`${hotel.name} ${i + 1}`} className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </section>

        <div className="grid lg:grid-cols-3 gap-8">

          <div className="lg:col-span-2 space-y-8">

            <header className="border-b border-[#153243]/15 pb-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#284B63]/75 mb-2">
                    {EXPERIENCE_LABELS[hotel.experienceType]}
                  </p>
                  <h1 className="font-display text-4xl md:text-5xl font-semibold tracking-tight">{hotel.name}</h1>
                  <p className="text-[#284B63] mt-2 flex items-center gap-2">
                    <span>📍</span> {hotel.location}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <div className="flex gap-1">
                    {[...Array(hotel.stars)].map((_, i) => (
                      <span key={i} className="text-amber-500 text-lg">★</span>
                    ))}
                  </div>
                  <span className="text-xs text-[#284B63] font-medium">{hotel.stars} estrellas</span>
                </div>
              </div>
            </header>

            <section>
              <h2 className="font-display text-2xl font-semibold mb-3">Sobre este hotel</h2>
              <p className="text-[#284B63] leading-relaxed">{hotel.description}</p>
            </section>

            <section>
              <h2 className="font-display text-2xl font-semibold mb-4">Servicios incluidos</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {hotel.services.map((service) => (
                  <div key={service} className="flex items-center gap-2 bg-[#F4F9E9] border border-[#153243]/15 rounded-xl px-4 py-3">
                    <span className="text-[#284B63]">✓</span>
                    <span className="text-sm font-medium text-[#153243]">{service}</span>
                  </div>
                ))}
              </div>
            </section>

            {hotel.exclusiveFeatures?.length > 0 && (
              <section>
                <h2 className="font-display text-2xl font-semibold mb-4">Características exclusivas</h2>
                <div className="space-y-3">
                  {hotel.exclusiveFeatures.map((feature) => (
                    <div key={feature} className="flex items-start gap-3 bg-[#284B63]/5 border border-[#153243]/15 rounded-2xl p-4">
                      <span className="text-[#284B63] text-lg">★</span>
                      <p className="text-[#153243] font-medium">{feature}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {images.length > 4 && (
              <section>
                <h2 className="font-display text-2xl font-semibold mb-4">Más fotos</h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {images.slice(4).map((img, i) => (
                    <div key={i} className="aspect-square rounded-2xl overflow-hidden bg-[#284B63]/10">
                      <img src={img} alt={`${hotel.name} ${i + 5}`} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* ── Reseñas ──────────────────────────────────────── */}
            <HotelReviews hotelId={hotelId} />
            {/* ── Ubicación ──────────────────────────────────────── */}
            {hotel.latitude && hotel.longitude && (
              <section>
                <h2 className="font-display text-2xl font-semibold mb-4">Ubicación</h2>
                <GoogleMapComponent
                  hotels={[{
                    id: hotel.id,
                    name: hotel.name,
                    latitude: hotel.latitude,
                    longitude: hotel.longitude,
                    address: hotel.location,
                  }]}
                  singleHotel={true}
                />
              </section>
            )}
          </div>

          <aside className="lg:sticky lg:top-24 self-start">
            <div className="bg-[#F4F9E9] border border-[#153243]/20 rounded-3xl p-6 shadow-lg">
              <div className="flex items-baseline justify-between mb-2">
                <span className="text-3xl font-black text-[#153243]">${hotel.price.toFixed(0)}</span>
                <span className="text-sm text-[#284B63]">/ noche</span>
              </div>
              <p className="text-xs text-[#284B63]/75 mb-6">USD por noche · Impuestos no incluidos</p>

              <Link
                href={`/hotels/${hotel.id}/reserve`}
                className="block w-full text-center rounded-full border-2 border-[#153243] bg-[#284B63] hover:bg-[#153243] text-[#F4F9E9] text-sm font-bold py-3.5 transition-colors mb-3"
              >
                Reservar ahora →
              </Link>

              <div className="border-t border-[#153243]/15 pt-4 mt-4 space-y-2">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#284B63] mb-3">Lo que incluye</p>
                {hotel.services.slice(0, 4).map((s) => (
                  <div key={s} className="flex items-center gap-2 text-sm text-[#153243]">
                    <span className="text-[#284B63]">✓</span> {s}
                  </div>
                ))}
                {hotel.services.length > 4 && (
                  <p className="text-xs text-[#284B63]/75 italic">+ {hotel.services.length - 4} servicios más</p>
                )}
              </div>
            </div>

            <div className="mt-4 bg-[#EEF0EB] border border-[#153243]/15 rounded-2xl p-5">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#284B63] mb-2">¿Necesitas ayuda?</p>
              <p className="text-sm text-[#153243] leading-relaxed">
                Reserva ahora y agrega experiencias adicionales como desayuno, spa, tours o transporte.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}