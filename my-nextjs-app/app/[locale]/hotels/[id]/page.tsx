"use client";
// app/[locale]/hotels/[id]/page.tsx

export const dynamic = "force-dynamic";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Link } from "@/i18n/navigation";
import HotelReviews from "@/app/components/HotelReviews";
import GoogleMapComponent from "@/app/components/GoogleMap";
import { useTranslations, useLocale } from "next-intl";

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

const SERVICE_DICT: Record<string, Record<string, string>> = {
  en: {
    "WiFi": "WiFi", "Breakfast": "Breakfast", "Concierge": "Concierge", "Room Service": "Room Service",
    "Spa": "Spa", "Rooftop": "Rooftop", "Pool": "Pool", "Chef Table": "Chef Table",
    "Airport Transfer": "Airport Transfer", "Pet Friendly": "Pet Friendly", "Yoga": "Yoga", "Winery": "Winery",
  },
  es: {
    "WiFi": "WiFi", "Breakfast": "Desayuno", "Concierge": "Conserje", "Room Service": "Servicio a la habitación",
    "Spa": "Spa", "Rooftop": "Terraza", "Pool": "Piscina", "Chef Table": "Mesa del Chef",
    "Airport Transfer": "Traslado al aeropuerto", "Pet Friendly": "Acepta Mascotas", "Yoga": "Yoga", "Winery": "Viñedo",
  }
};

export default function HotelDetailPage() {
  const params = useParams();
  const hotelId = params.id as string;
  const t = useTranslations("hotelDetail");
  const locale = useLocale();
  const translateService = (s: string) => SERVICE_DICT[locale]?.[s] || s;

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
        <p className="text-[#284B63]">{t("loading")}</p>
      </div>
    );
  }

  if (!hotel) {
    return (
      <div className="min-h-screen bg-[#EEF0EB] flex items-center justify-center">
        <p className="text-[#284B63]">{t("notFound")}</p>
      </div>
    );
  }

  const images = hotel.images?.length > 0
    ? hotel.images
    : EXPERIENCE_IMAGES[hotel.experienceType] || EXPERIENCE_IMAGES.RELAX;

  return (
    <div className="min-h-screen bg-[#EEF0EB] text-[#153243]">
      {/* Top nav */}
      <nav className="bg-[#F4F9E9] border-b border-[#153243]/15 px-4 sm:px-6 h-14 flex items-center justify-between sticky top-0 z-10">
        <Link href="/hotels" className="flex items-center gap-2 text-[#153243] font-semibold text-sm">
          {t("backToHotels")}
        </Link>
        <Link href="/dashboard" className="text-sm text-[#284B63] hover:text-[#153243] transition-colors">
          {t("myProfile")}
        </Link>
      </nav>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-8">

        {/* Gallery */}
        <section className="mb-6">
          <div className="h-48 sm:h-64 md:h-80 lg:h-[400px] rounded-2xl sm:rounded-3xl overflow-hidden bg-[#284B63]/10 mb-2">
            <img src={images[mainImage]} alt={hotel.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          </div>
          <div className="grid grid-cols-4 gap-2 sm:gap-3">
            {images.slice(0, 4).map((img, i) => (
              <button
                key={i}
                onClick={() => setMainImage(i)}
                className={`h-16 sm:h-20 md:h-24 rounded-xl sm:rounded-2xl overflow-hidden border-2 transition-all ${mainImage === i ? "border-[#153243] shadow-lg" : "border-transparent opacity-70 hover:opacity-100"}`}
              >
                <img src={img} alt={`${hotel.name} ${i + 1}`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </button>
            ))}
          </div>
        </section>

        <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
          <div className="lg:col-span-2 space-y-8">

            {/* Header */}
            <header className="border-b border-[#153243]/15 pb-6">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#284B63]/75 mb-2">
                    {EXPERIENCE_LABELS[hotel.experienceType]}
                  </p>
                  <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight">{hotel.name}</h1>
                  <p className="text-[#284B63] mt-2 flex items-center gap-2">
                    <span>📍</span> {hotel.location}
                  </p>
                </div>
                <div className="flex flex-row sm:flex-col items-center sm:items-end gap-2">
                  <div className="flex gap-1">
                    {[...Array(hotel.stars)].map((_, i) => (
                      <span key={i} className="text-amber-500 text-lg">★</span>
                    ))}
                  </div>
                  <span className="text-xs text-[#284B63] font-medium">
                    {t("stars", { count: hotel.stars })}
                  </span>
                </div>
              </div>
            </header>

            {/* About */}
            <section>
              <h2 className="font-display text-xl sm:text-2xl font-semibold mb-3">{t("about")}</h2>
              <p className="text-[#284B63] leading-relaxed text-sm sm:text-base">{hotel.description}</p>
            </section>

            {/* Services */}
            <section>
              <h2 className="font-display text-xl sm:text-2xl font-semibold mb-4">{t("includedServices")}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {hotel.services.map((service) => (
                  <div key={service} className="flex items-center gap-2 bg-[#F4F9E9] border border-[#153243]/15 rounded-xl px-4 py-3">
                    <span className="text-[#284B63]">✓</span>
                    <span className="text-sm font-medium text-[#153243]">{translateService(service)}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Exclusive features */}
            {hotel.exclusiveFeatures?.length > 0 && (
              <section>
                <h2 className="font-display text-xl sm:text-2xl font-semibold mb-4">{t("exclusiveFeatures")}</h2>
                <div className="space-y-3">
                  {hotel.exclusiveFeatures.map((feature) => (
                    <div key={feature} className="flex items-start gap-3 bg-[#284B63]/5 border border-[#153243]/15 rounded-2xl p-4">
                      <span className="text-[#284B63] text-lg">★</span>
                      <p className="text-[#153243] font-medium text-sm sm:text-base">{feature}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* More photos */}
            {images.length > 4 && (
              <section>
                <h2 className="font-display text-xl sm:text-2xl font-semibold mb-4">{t("morePhotos")}</h2>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {images.slice(4).map((img, i) => (
                    <div key={i} className="aspect-square rounded-2xl overflow-hidden bg-[#284B63]/10">
                      <img src={img} alt={`${hotel.name} ${i + 5}`} className="w-full h-full object-cover" />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Reviews — dual panel */}
            <HotelReviews hotelId={hotelId} />

            {/* Map */}
            {hotel.latitude && hotel.longitude && (
              <section>
                <h2 className="font-display text-xl sm:text-2xl font-semibold mb-4">{t("location")}</h2>
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

          {/* Booking sidebar */}
          <aside className="lg:sticky lg:top-24 self-start">
            <div className="bg-[#F4F9E9] border border-[#153243]/20 rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-lg">
              <div className="flex items-baseline justify-between mb-2">
                <span className="text-2xl sm:text-3xl font-black text-[#153243]">${hotel.price.toFixed(0)}</span>
                <span className="text-sm text-[#284B63]">{t("pricePerNight")}</span>
              </div>
              <p className="text-xs text-[#284B63]/75 mb-6">{t("taxesNotIncluded")}</p>

              <Link
                href={`/hotels/${hotel.id}/reserve`}
                className="block w-full text-center rounded-full border-2 border-[#153243] bg-[#284B63] hover:bg-[#153243] text-[#F4F9E9] text-sm font-bold py-3.5 transition-colors mb-3"
              >
                {t("bookNow")}
              </Link>

              <div className="border-t border-[#153243]/15 pt-4 mt-4 space-y-2">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#284B63] mb-3">{t("includes")}</p>
                {hotel.services.slice(0, 4).map((s) => (
                  <div key={s} className="flex items-center gap-2 text-sm text-[#153243]">
                    <span className="text-[#284B63]">✓</span> {translateService(s)}
                  </div>
                ))}
                {hotel.services.length > 4 && (
                  <p className="text-xs text-[#284B63]/75 italic">
                    {t("moreServices", { count: hotel.services.length - 4 })}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-4 bg-[#EEF0EB] border border-[#153243]/15 rounded-2xl p-5">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-[#284B63] mb-2">{t("needHelp")}</p>
              <p className="text-sm text-[#153243] leading-relaxed">{t("helpText")}</p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
