// app/page.tsx
import { auth } from "@/lib/auth";
import Link from "next/link";
import HomeSearchForm from "./components/HomeSearchForm";

export default async function Home() {
  const session = await auth();
  const isLoggedIn = !!session?.user?.id;

  return (
    <div className="relative min-h-[calc(100vh-4rem)] overflow-hidden">

      {/* ── Fondo de mar ───────────────────────────────────────────── */}
      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=2400&q=90"
          alt="Mar"
          className="w-full h-full object-cover"
        />
        {/* Overlay gradiente para mejor contraste */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#153243]/40 via-[#153243]/10 to-[#153243]/30" />
      </div>

      {/* ── Contenido ──────────────────────────────────────────────── */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 md:px-8 py-12 md:py-20 grid lg:grid-cols-2 gap-12 items-center min-h-[calc(100vh-4rem)]">

        {/* ── Formulario izquierda ──────────────────────────────────── */}
        <div className="lg:ml-0">
          <HomeSearchForm />
        </div>

        {/* ── Wave en la derecha ────────────────────────────────────── */}
        <div className="hidden lg:flex flex-col items-end justify-center text-right">
          <p className="text-xs font-semibold uppercase tracking-[0.4em] text-white/80 mb-4">
            Boutique Hotels Chile
          </p>
          <h1 className="font-display text-[10rem] xl:text-[14rem] font-bold text-white leading-[0.8] tracking-tighter drop-shadow-2xl">
            Wave<span className="text-[#F4F9E9]">.</span>
          </h1>
          <p className="font-display text-2xl xl:text-3xl text-white/90 italic mt-4 max-w-md drop-shadow-lg">
            Sumérgete en estadías que se sienten como un sueño.
          </p>

          {/* Stats */}
          <div className="flex gap-8 mt-8 pt-8 border-t border-white/30 w-full max-w-md justify-end">
            {[
              { valor: "13+",  label: "Hoteles" },
              { valor: "4.9★", label: "Valoración" },
              { valor: "5",    label: "Regiones" },
            ].map((s) => (
              <div key={s.label} className="text-right">
                <p className="font-display text-3xl font-bold text-white drop-shadow">{s.valor}</p>
                <p className="text-xs text-white/70 uppercase tracking-wider mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ── Logo Wave en mobile ────────────────────────────────────── */}
        <div className="lg:hidden text-center">
          <h1 className="font-display text-7xl md:text-8xl font-bold text-white tracking-tighter drop-shadow-2xl">
            Wave<span className="text-[#F4F9E9]">.</span>
          </h1>
          <p className="text-white/80 mt-2">Boutique Hotels Chile</p>
        </div>
      </div>

      {/* ── Indicador scroll ─────────────────────────────────────────── */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 text-white/60">
        <span className="text-xs uppercase tracking-[0.3em]">Explora</span>
        <div className="w-px h-8 bg-white/40 animate-pulse" />
      </div>

      {/* ── CTA si no está logueado ─────────────────────────────────── */}
      {!isLoggedIn && (
        <div className="relative z-10 bg-[#F4F9E9] border-t border-[#153243]/15">
          <div className="max-w-7xl mx-auto px-6 md:px-8 py-16 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#284B63] mb-3">
              Únete gratis
            </p>
            <h2 className="font-display text-4xl md:text-5xl font-semibold text-[#153243] tracking-tight">
              Tu próxima estadía boutique
              <br />
              <span className="text-[#284B63] italic">te está esperando.</span>
            </h2>
            <p className="text-[#284B63]/85 mt-4 max-w-md mx-auto">
              Crea tu cuenta gratis y accede a hoteles boutique únicos en todo Chile.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
              <Link
                href="/auth/register"
                className="inline-flex items-center justify-center gap-2 bg-[#284B63] hover:bg-[#153243] text-[#F4F9E9] font-bold px-8 py-4 rounded-full transition-colors text-sm"
              >
                Crear cuenta gratis →
              </Link>
              <Link
                href="/auth/login"
                className="inline-flex items-center justify-center gap-2 bg-[#EEF0EB] hover:bg-[#F4F9E9] border-2 border-[#153243] text-[#153243] font-bold px-8 py-4 rounded-full transition-colors text-sm"
              >
                Ya tengo cuenta
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
