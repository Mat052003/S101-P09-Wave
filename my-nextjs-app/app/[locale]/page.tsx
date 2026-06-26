// app/[locale]/page.tsx
import { auth } from "@/lib/auth";
import { Link } from "@/i18n/navigation";
import HomeSearchForm from "../components/HomeSearchForm";
import HeroSlideshow from "../components/HeroSlideshow";
import { getTranslations } from "next-intl/server";

type TopHotel = {
  id: string;
  name: string;
  location: string;
  stars: number;
  price: number;
  images: string[];
  experienceType: string;
};

const EXPERIENCE_TYPES = [
  { type: "RELAX",       label: "Relax",        icon: "🌊" },
  { type: "WELLNESS",    label: "Wellness",      icon: "🧘" },
  { type: "GASTRONOMIC", label: "Gastronómico",  icon: "🍽️" },
  { type: "ADVENTURE",   label: "Aventura",      icon: "🏔️" },
  { type: "ROMANTIC",    label: "Romántico",     icon: "🌹" },
  { type: "CULTURAL",    label: "Cultural",      icon: "🎨" },
];

const PILLARS = [
  { icon: "✦", title: "Selección curada",        desc: "Cada hotel es evaluado por nuestro equipo antes de publicarse." },
  { icon: "◈", title: "Experiencias únicas",      desc: "Más que una cama: vivencias que recordarás para siempre." },
  { icon: "◎", title: "Atención personalizada",   desc: "Soporte humano disponible antes y durante tu estadía." },
];

const STATIC_EXPERIENCES = [
  { icon: "🛁", tag: "Bienestar",    title: "Rituales de Spa",    desc: "Masajes, baños termales y tratamientos de belleza en entornos naturales únicos de Chile." },
  { icon: "🌿", tag: "Aventura",     title: "Tours & Naturaleza", desc: "Excursiones guiadas a volcanes, bosques nativos, glaciares y costas del Pacífico." },
  { icon: "🍷", tag: "Gastronomía",  title: "Alta Cocina Local",  desc: "Menús de temporada con productos locales y catas de vinos en viñedos boutique." },
];

const FALLBACK_IMAGES: Record<string, string> = {
  RELAX:       "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800&q=80",
  WELLNESS:    "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&q=80",
  GASTRONOMIC: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80",
  ADVENTURE:   "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=800&q=80",
  ROMANTIC:    "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80",
  CULTURAL:    "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80",
};

async function getTopHotels(): Promise<TopHotel[]> {
  try {
    const base = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const res = await fetch(`${base}/api/hotels?minPrice=0&maxPrice=999999`, { cache: "no-store" });
    if (!res.ok) return [];
    const data = await res.json();
    const hotels: TopHotel[] = data.hotels || [];
    return [...hotels].sort((a, b) => b.stars - a.stars).slice(0, 4);
  } catch {
    return [];
  }
}

export default async function Home() {
  const session = await auth();
  const isLoggedIn = !!session?.user?.id;
  const t = await getTranslations("home");
  const topHotels = await getTopHotels();

  return (
    <div className="bg-[#FAF6F0]">
      {/* ── HERO ─────────────────────────────────────────────────── */}
      <section className="relative min-h-[85vh] lg:h-[90vh] lg:max-h-[800px] overflow-hidden flex flex-col justify-center">
        <div className="absolute inset-0">
          <HeroSlideshow />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-[#0B1F2D]/85 via-[#0B1F2D]/50 to-[#0B1F2D]/20 lg:to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B1F2D]/80 lg:from-[#0B1F2D]/60 via-transparent to-transparent" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 md:px-8 w-full flex flex-col lg:grid lg:grid-cols-2 gap-8 lg:gap-12 items-center py-12 lg:py-8 mt-4 lg:mt-0">
          <div className="order-2 lg:order-1 w-full flex justify-center lg:justify-start">
            <HomeSearchForm />
          </div>

          <div className="order-1 lg:order-2 text-center lg:text-right flex flex-col items-center lg:items-end justify-center w-full">
            <p className="text-[#C9A87C] text-[10px] md:text-xs font-semibold uppercase tracking-[0.3em] lg:tracking-[0.4em] mb-2 lg:mb-4">
              Boutique Hotels · Chile
            </p>
            <h1 className="font-display font-bold text-white leading-[0.9] lg:leading-[0.85] tracking-tight">
              <span className="block text-6xl md:text-[7rem] xl:text-[9rem]">Wave</span>
              <span className="block text-6xl md:text-[7rem] xl:text-[9rem] text-[#C9A87C] italic lg:-mt-3">.</span>
            </h1>
            <p className="font-display italic text-white/90 text-base md:text-lg xl:text-xl mt-3 lg:mt-5 max-w-xs md:max-w-sm leading-relaxed hidden sm:block">
              {t("headline")}
            </p>
            <div className="hidden lg:flex gap-8 mt-6 pt-6 border-t border-white/20">
              {[
                { n: "15+",  l: "Hoteles"    },
                { n: "4.9★", l: "Valoración" },
                { n: "5",    l: "Regiones"   },
              ].map((s) => (
                <div key={s.l} className="text-right">
                  <p className="font-display text-2xl font-bold text-white">{s.n}</p>
                  <p className="text-white/50 text-xs uppercase tracking-wider mt-1">{s.l}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────── */}
      {!isLoggedIn && (
        <section className="py-20 px-6 md:px-8 bg-[#0B1F2D]">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-[#C9A87C] text-xs font-semibold uppercase tracking-[0.3em] mb-4">{t("tagline")}</p>
            <h2 className="font-display text-4xl md:text-5xl font-bold text-white leading-tight">
              Tu próxima estadía<br />
              <span className="italic text-[#C9A87C]">te está esperando</span>
            </h2>
            <p className="text-white/50 mt-5 max-w-md mx-auto text-sm">
              {t("description")}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
              <Link href="/auth/register"
                className="bg-[#C9A87C] hover:bg-[#E8845A] text-[#0B1F2D] font-bold px-8 py-3.5 rounded-full transition-colors text-sm">
                Crear cuenta gratis →
              </Link>
              <Link href="/auth/login"
                className="border border-white/20 hover:border-white/40 text-white font-semibold px-8 py-3.5 rounded-full transition-colors text-sm">
                Ya tengo cuenta
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ── HOTELES MEJOR CALIFICADOS ────────────────────────────── */}
      {topHotels.length > 0 && (
        <section className="py-20 px-6 md:px-8 bg-[#FAF6F0]">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-end justify-between mb-10">
              <div>
                <p className="text-[#C9A87C] text-xs font-semibold uppercase tracking-[0.3em] mb-2">Top Rating</p>
                <h2 className="font-display text-3xl md:text-4xl font-bold text-[#0B1F2D]">Hoteles mejor calificados</h2>
              </div>
              <Link href="/hotels"
                className="hidden sm:inline-flex items-center gap-1 text-sm font-semibold text-[#C9A87C] hover:text-[#0B1F2D] transition-colors">
                Ver todos →
              </Link>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {topHotels.map((hotel) => (
                <Link key={hotel.id} href={`/hotels/${hotel.id}`}
                  className="group flex flex-col bg-white rounded-2xl overflow-hidden border border-[#0B1F2D]/8 hover:shadow-[0_8px_24px_rgba(11,31,45,0.12)] transition-shadow">
                  <div className="h-44 overflow-hidden bg-[#0B1F2D]/10 shrink-0">
                    <img
                      src={hotel.images?.[0] || FALLBACK_IMAGES[hotel.experienceType] || FALLBACK_IMAGES.RELAX}
                      alt={hotel.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-4 flex-1 flex flex-col">
                    <h3 className="font-display text-base font-semibold text-[#0B1F2D] leading-tight line-clamp-1">{hotel.name}</h3>
                    <p className="text-xs text-[#0B1F2D]/50 mt-0.5">{hotel.location}</p>
                    <div className="mt-auto pt-3 flex items-end justify-between">
                      <span className="text-[#C9A87C] text-sm tracking-tight">{"★".repeat(hotel.stars)}</span>
                      <span className="text-sm font-bold text-[#0B1F2D]">
                        ${hotel.price.toFixed(0)}<span className="text-xs font-normal text-[#0B1F2D]/45">/noche</span>
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            <div className="mt-10 text-center">
              <Link href="/hotels"
                className="inline-flex bg-[#0B1F2D] hover:bg-[#1B4965] text-white text-sm font-semibold px-8 py-3.5 rounded-full transition-colors">
                Ver todos los hoteles
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ── TIPOS DE EXPERIENCIAS ─────────────────────────────────── */}
      <section className="py-20 px-6 md:px-8 bg-[#0B1F2D]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-[#C9A87C] text-xs font-semibold uppercase tracking-[0.3em] mb-3">Encuentra tu estilo</p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white">Tipos de experiencias</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {EXPERIENCE_TYPES.map(({ type, label, icon }) => (
              <Link key={type} href={`/hotels?experienceType=${type}`}
                className="group flex flex-col items-center gap-3 p-5 rounded-2xl border border-white/10 hover:border-[#C9A87C]/60 hover:bg-white/5 transition-all text-center">
                <span className="text-3xl">{icon}</span>
                <span className="text-sm font-semibold text-white/75 group-hover:text-[#C9A87C] transition-colors">{label}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── QUÉ ES WAVE ───────────────────────────────────────────── */}
      <section className="py-20 px-6 md:px-8 bg-[#FAF6F0]">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div>
              <p className="text-[#C9A87C] text-xs font-semibold uppercase tracking-[0.3em] mb-3">Nuestra misión</p>
              <h2 className="font-display text-3xl md:text-4xl font-bold text-[#0B1F2D] leading-tight">
                ¿Qué es <span className="italic text-[#C9A87C]">Wave</span>?
              </h2>
              <p className="text-[#0B1F2D]/60 mt-5 text-sm leading-relaxed">
                Wave es una plataforma exclusiva de hoteles boutique en Chile. Curada a mano para viajeros que buscan experiencias auténticas, diseño de autor y atención personalizada lejos del turismo masivo.
              </p>
              <p className="text-[#0B1F2D]/60 mt-3 text-sm leading-relaxed">
                Desde la costa del Pacífico hasta la Patagonia, conectamos a los mejores anfitriones independientes con huéspedes que valoran lo genuino.
              </p>
              <Link href="/hotels"
                className="inline-flex mt-8 bg-[#C9A87C] hover:bg-[#0B1F2D] text-[#0B1F2D] hover:text-white text-sm font-bold px-7 py-3 rounded-full transition-colors">
                Explorar hoteles
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {PILLARS.map(({ icon, title, desc }) => (
                <div key={title}
                  className="flex flex-col items-center text-center p-6 rounded-2xl bg-white border border-[#0B1F2D]/8 shadow-sm">
                  <span className="text-2xl text-[#C9A87C] mb-3">{icon}</span>
                  <h3 className="font-display text-sm font-bold text-[#0B1F2D] mb-2">{title}</h3>
                  <p className="text-xs text-[#0B1F2D]/50 leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── EXPERIENCIAS DESTACADAS ───────────────────────────────── */}
      <section className="py-20 px-6 md:px-8 bg-[#1B4965]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-[#C9A87C] text-xs font-semibold uppercase tracking-[0.3em] mb-3">Más que un hotel</p>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white">Experiencias destacadas</h2>
            <p className="text-white/50 mt-3 text-sm max-w-lg mx-auto leading-relaxed">
              Cada estadía incluye acceso a experiencias cuidadosamente seleccionadas para hacer de tu viaje algo extraordinario.
            </p>
          </div>
          <div className="grid gap-6 sm:grid-cols-3">
            {STATIC_EXPERIENCES.map(({ icon, tag, title, desc }) => (
              <div key={title}
                className="flex flex-col bg-white/5 border border-white/10 rounded-2xl p-7 hover:bg-white/8 hover:border-[#C9A87C]/30 transition-all">
                <span className="text-4xl block mb-4">{icon}</span>
                <span className="text-[#C9A87C] text-[10px] font-semibold uppercase tracking-[0.25em]">{tag}</span>
                <h3 className="font-display text-lg font-bold text-white mt-2 mb-3">{title}</h3>
                <p className="text-white/55 text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
