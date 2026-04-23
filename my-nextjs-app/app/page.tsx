// app/page.tsx
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import Link from "next/link";
import prisma from "@/lib/prisma";

export default async function Home() {
  const session = await auth();

  // Si está logueado, ir directo a hoteles
  if (session?.user?.id) {
    redirect("/hotels");
  }

  // Obtener hoteles destacados para mostrar en la landing
  const hoteles = await prisma.hotel.findMany({
    take: 6,
    orderBy: { stars: "desc" },
  });

  const experienceColors: Record<string, string> = {
    ROMANTIC:     "bg-rose-100 text-rose-700",
    GASTRONOMIC:  "bg-orange-100 text-orange-700",
    WELLNESS:     "bg-teal-100 text-teal-700",
    ADVENTURE:    "bg-amber-100 text-amber-700",
    CULTURAL:     "bg-indigo-100 text-indigo-700",
    RELAX:        "bg-sky-100 text-sky-700",
    NATURE:       "bg-green-100 text-green-700",
    CITY:         "bg-slate-100 text-slate-700",
  };

  // Imagen por tipo de experiencia (Unsplash)
  const experienceImages: Record<string, string> = {
    ROMANTIC:    "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&q=80",
    GASTRONOMIC: "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=800&q=80",
    WELLNESS:    "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&q=80",
    ADVENTURE:   "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=800&q=80",
    CULTURAL:    "https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=800&q=80",
    RELAX:       "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800&q=80",
    NATURE:      "https://images.unsplash.com/photo-1510798831971-661eb04b3739?w=800&q=80",
    CITY:        "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&q=80",
  };

  const defaultImg = "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&q=80";

  return (
    <div className="min-h-screen bg-[#f5f3ef]" style={{ fontFamily: "'Georgia', serif" }}>

      {/* ── NAVBAR ──────────────────────────────────────────────── */}
      <nav className="fixed top-0 w-full z-50 bg-[#f5f3ef]/90 backdrop-blur-md border-b border-stone-200/60">
        <div className="max-w-7xl mx-auto px-8 h-16 flex items-center justify-between">
          <span className="text-2xl font-bold tracking-tight text-[#1a2e35]">
            wave<span className="text-teal-500">.</span>
          </span>
          <div className="flex items-center gap-4">
            <Link href="/auth/login"
              className="text-sm text-[#1a2e35]/60 hover:text-[#1a2e35] font-medium transition-colors">
              Iniciar sesión
            </Link>
            <Link href="/auth/register"
              className="bg-[#1a2e35] hover:bg-teal-700 text-white text-sm font-semibold px-5 py-2.5 rounded-full transition-colors">
              Registrarse gratis
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center overflow-hidden pt-16">
        {/* Imagen de fondo */}
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=1800&q=90"
            alt="Hero"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#1a2e35]/80 via-[#1a2e35]/40 to-transparent" />
        </div>

        <div className="relative max-w-7xl mx-auto px-8 py-32">
          <div className="max-w-2xl space-y-8">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2">
              <span className="w-2 h-2 bg-teal-400 rounded-full animate-pulse" />
              <span className="text-white/90 text-xs font-medium tracking-wider uppercase">
                {hoteles.length}+ hoteles boutique en Chile
              </span>
            </div>

            <h1 className="text-6xl md:text-7xl font-bold text-white leading-[1.1] tracking-tight">
              Estadías que<br />
              <span className="text-teal-300">se recuerdan.</span>
            </h1>

            <p className="text-xl text-white/70 leading-relaxed max-w-lg">
              Descubre hoteles boutique únicos en Chile. Desde el desierto de Atacama hasta la Patagonia.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/auth/register"
                className="inline-flex items-center justify-center gap-2 bg-teal-500 hover:bg-teal-400 text-white font-bold px-8 py-4 rounded-full transition-all text-base shadow-xl shadow-teal-900/30">
                Comenzar gratis
                <span>→</span>
              </Link>
              <Link href="/auth/login"
                className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/30 text-white font-semibold px-8 py-4 rounded-full transition-all text-base">
                Ya tengo cuenta
              </Link>
            </div>

            {/* Stats */}
            <div className="flex gap-10 pt-4">
              {[
                { valor: "13+",  label: "Hoteles" },
                { valor: "4.9★", label: "Valoración" },
                { valor: "5",    label: "Regiones" },
              ].map((s) => (
                <div key={s.label}>
                  <p className="text-2xl font-bold text-white">{s.valor}</p>
                  <p className="text-xs text-white/50 uppercase tracking-wider mt-1">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/40">
          <span className="text-xs uppercase tracking-widest">Explorar</span>
          <div className="w-px h-8 bg-white/20" />
        </div>
      </section>

      {/* ── CATEGORÍAS ──────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-8 py-24">
        <div className="text-center mb-14">
          <p className="text-xs text-teal-600 font-bold uppercase tracking-widest mb-3">Experiencias</p>
          <h2 className="text-4xl font-bold text-[#1a2e35] tracking-tight">¿Qué tipo de viaje buscas?</h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { tipo: "ADVENTURE",   icono: "🏔️", label: "Aventura",    desc: "Torres del Paine, Atacama" },
            { tipo: "WELLNESS",    icono: "🧘", label: "Bienestar",   desc: "Termas, spa y descanso"   },
            { tipo: "GASTRONOMIC", icono: "🍷", label: "Gastronomía", desc: "Viñas y chef tables"       },
            { tipo: "CULTURAL",    icono: "🎨", label: "Cultural",    desc: "Arte, historia y barrios"  },
            { tipo: "ROMANTIC",    icono: "🌹", label: "Romántico",   desc: "Escapadas en pareja"       },
            { tipo: "RELAX",       icono: "🌊", label: "Relax",       desc: "Playas y desconexión"      },
            { tipo: "NATURE",      icono: "🌿", label: "Naturaleza",  desc: "Lagos, bosques y volcanes" },
            { tipo: "CITY",        icono: "🏙️", label: "Ciudad",      desc: "Barrios y vida urbana"     },
          ].map((cat) => (
            <Link key={cat.tipo} href="/auth/register"
              className="group relative bg-white rounded-2xl p-6 border border-stone-100 hover:border-teal-200 hover:shadow-lg transition-all duration-300 overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-teal-50/0 to-teal-50/60 opacity-0 group-hover:opacity-100 transition-opacity" />
              <div className="relative">
                <span className="text-3xl mb-3 block">{cat.icono}</span>
                <p className="font-bold text-[#1a2e35] text-sm">{cat.label}</p>
                <p className="text-xs text-stone-400 mt-1 leading-relaxed">{cat.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── HOTELES DESTACADOS ───────────────────────────────────── */}
      <section className="bg-[#1a2e35] py-24">
        <div className="max-w-7xl mx-auto px-8">
          <div className="flex items-end justify-between mb-14">
            <div>
              <p className="text-xs text-teal-400 font-bold uppercase tracking-widest mb-3">Selección</p>
              <h2 className="text-4xl font-bold text-white tracking-tight">Hoteles destacados</h2>
            </div>
            <Link href="/auth/register"
              className="text-sm text-teal-400 hover:text-teal-300 font-semibold transition-colors">
              Ver todos →
            </Link>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {hoteles.map((hotel) => {
              const img = hotel.images?.[0] ||
                experienceImages[hotel.experienceType as string] ||
                defaultImg;
              const expColor = experienceColors[hotel.experienceType as string] || "bg-slate-100 text-slate-700";

              return (
                <Link key={hotel.id} href="/auth/register"
                  className="group bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 rounded-2xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/20">
                  {/* Imagen */}
                  <div className="relative h-52 overflow-hidden">
                    <img
                      src={img}
                      alt={hotel.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                    {/* Badge estrellas */}
                    <div className="absolute top-3 left-3 bg-black/40 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-1">
                      <span className="text-amber-400 text-xs">★</span>
                      <span className="text-white text-xs font-bold">{hotel.stars}.0</span>
                    </div>
                    {/* Badge experiencia */}
                    {hotel.experienceType && (
                      <div className={`absolute top-3 right-3 text-xs font-bold px-2.5 py-1 rounded-full ${expColor}`}>
                        {hotel.experienceType.charAt(0) + hotel.experienceType.slice(1).toLowerCase()}
                      </div>
                    )}
                  </div>

                  {/* Contenido */}
                  <div className="p-5">
                    <h3 className="font-bold text-white text-base group-hover:text-teal-300 transition-colors">
                      {hotel.name}
                    </h3>
                    <p className="text-white/40 text-xs mt-1">📍 {hotel.location}</p>
                    <p className="text-white/60 text-sm mt-3 leading-relaxed line-clamp-2">
                      {hotel.description}
                    </p>
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/10">
                      <div>
                        <span className="text-xl font-black text-white">${hotel.price}</span>
                        <span className="text-white/40 text-xs"> / noche</span>
                      </div>
                      <span className="text-xs text-teal-400 font-semibold group-hover:translate-x-1 transition-transform inline-block">
                        Ver hotel →
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── CÓMO FUNCIONA ────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-8 py-24">
        <div className="text-center mb-16">
          <p className="text-xs text-teal-600 font-bold uppercase tracking-widest mb-3">Proceso</p>
          <h2 className="text-4xl font-bold text-[#1a2e35] tracking-tight">¿Cómo funciona Wave?</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            { num: "01", icono: "🔍", titulo: "Busca y compara",    desc: "Filtra por experiencia, precio y servicios. Compara hasta 3 hoteles lado a lado." },
            { num: "02", icono: "📅", titulo: "Reserva en minutos", desc: "Elige tus fechas, agrega experiencias adicionales y confirma tu estadía al instante." },
            { num: "03", icono: "🌟", titulo: "Vive la experiencia", desc: "Llega a tu hotel boutique y disfruta de una estadía única. Luego comparte tu reseña." },
          ].map((paso) => (
            <div key={paso.num} className="relative bg-white rounded-2xl border border-stone-100 p-8 hover:shadow-lg transition-shadow">
              <span className="text-6xl font-black text-stone-100 absolute top-4 right-6 select-none">{paso.num}</span>
              <div className="relative">
                <span className="text-4xl mb-4 block">{paso.icono}</span>
                <h3 className="text-lg font-bold text-[#1a2e35] mb-2">{paso.titulo}</h3>
                <p className="text-stone-500 text-sm leading-relaxed">{paso.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── BANNER CTA ───────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-8 pb-24">
        <div className="relative bg-[#1a2e35] rounded-3xl overflow-hidden px-12 py-20 text-center">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-teal-400/10 rounded-full blur-3xl" />
          <div className="relative space-y-6">
            <p className="text-teal-400 text-xs font-bold uppercase tracking-widest">Únete gratis</p>
            <h2 className="text-4xl md:text-5xl font-bold text-white tracking-tight">
              Tu próxima estadía perfecta<br />
              <span className="text-teal-300">está a un clic.</span>
            </h2>
            <p className="text-white/50 max-w-md mx-auto leading-relaxed">
              Crea tu cuenta gratis y accede a los mejores hoteles boutique de Chile.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
              <Link href="/auth/register"
                className="inline-flex items-center justify-center gap-2 bg-teal-500 hover:bg-teal-400 text-white font-bold px-8 py-4 rounded-full transition-all text-sm shadow-xl shadow-teal-900/30">
                Crear cuenta gratis →
              </Link>
              <Link href="/auth/login"
                className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 border border-white/20 text-white font-semibold px-8 py-4 rounded-full transition-all text-sm">
                Ya tengo cuenta
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────── */}
      <footer className="border-t border-stone-200 bg-[#f5f3ef]">
        <div className="max-w-7xl mx-auto px-8 py-10 flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="text-xl font-bold text-[#1a2e35]">
            wave<span className="text-teal-500">.</span>
          </span>
          <p className="text-xs text-stone-400">© 2025 Wave Boutique Hotels · S101-P09 · Ingeniería Civil Industrial</p>
          <div className="flex gap-6 text-xs text-stone-400">
            <Link href="/auth/login" className="hover:text-[#1a2e35] transition-colors">Login</Link>
            <Link href="/auth/register" className="hover:text-[#1a2e35] transition-colors">Registro</Link>
            <Link href="/hotels" className="hover:text-[#1a2e35] transition-colors">Hoteles</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}

